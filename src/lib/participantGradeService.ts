import {
  normalizeGradeLevelStorage,
  type GradeLevel,
} from '../data/gradeLevelOptions';
import { isFamilyGradeBand, type FamilyGradeBand } from '../data/familyGradeBandOptions';
import { isMirandaGradeBand, type MirandaGradeBand } from '../types/mirandaAdaptiveQuest';
import { CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import { resolveTrackingProgramCode } from './activeProgramContext';
import { getGradeBand } from './getGradeBand';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { loadLocalParticipants, saveLocalParticipant } from './pilotTrackingLocalStorage';
import {
  hasFamilyCompatibilitySession,
  updateFamilyCompatibilityParticipantGrade,
} from './familyPortalChildrenApi';

export type ParticipantGradeSettings = {
  grade_level?: GradeLevel | null;
  grade_band?: FamilyGradeBand | MirandaGradeBand | string | null;
  allow_stretch_level: boolean;
};

export type SaveParticipantGradeInput = {
  grade_level?: GradeLevel | string | null;
  grade_band?: string | null;
  allow_stretch_level?: boolean;
};

function isMissingGradeColumnError(message: string): boolean {
  return /grade_level|grade_band|allow_stretch_level|column.*does not exist|42703/i.test(message);
}

function notifyGradeSaved(participantId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(CHILD_PROFILE_UPDATED_EVENT, { detail: { participantId } }),
  );
}

function normalizeGradePayload(input: SaveParticipantGradeInput): ParticipantGradeSettings {
  const allow_stretch_level = Boolean(input.allow_stretch_level);
  const normalizedLevel = normalizeGradeLevelStorage(input.grade_level);

  if (normalizedLevel) {
    return {
      grade_level: normalizedLevel,
      grade_band: getGradeBand(normalizedLevel),
      allow_stretch_level,
    };
  }

  const grade_band = input.grade_band?.trim() || null;
  if (grade_band && isFamilyGradeBand(grade_band)) {
    return { grade_level: null, grade_band, allow_stretch_level };
  }
  if (grade_band && isMirandaGradeBand(grade_band)) {
    return { grade_level: null, grade_band, allow_stretch_level };
  }

  return { grade_level: null, grade_band: null, allow_stretch_level };
}

function updateLocalParticipantGrade(
  participantId: string,
  settings: ParticipantGradeSettings,
): void {
  const id = participantId.trim();
  const now = new Date().toISOString();
  const match = loadLocalParticipants().find((row) => row.id === id);

  if (match) {
    saveLocalParticipant({
      ...match,
      grade_level: settings.grade_level ?? undefined,
      grade_band: settings.grade_band ?? undefined,
      allow_stretch_level: settings.allow_stretch_level,
      updated_at: now,
    });
    return;
  }

  saveLocalParticipant({
    id,
    role: 'student',
    program_code: resolveTrackingProgramCode()?.trim() || '',
    grade_level: settings.grade_level ?? undefined,
    grade_band: settings.grade_band ?? undefined,
    allow_stretch_level: settings.allow_stretch_level,
    created_at: now,
    updated_at: now,
  });
}

/** Save canonical grade_level (auto-computes grade_band via getGradeBand) */
export async function saveParticipantGradeSettings(
  participantId: string,
  input: SaveParticipantGradeInput,
): Promise<{ success: boolean; error?: string; warning?: string }> {
  const id = participantId.trim();
  if (!id) {
    return { success: false, error: 'Missing participant id.' };
  }

  const settings = normalizeGradePayload({
    grade_level: input.grade_level,
    grade_band: input.grade_band,
    allow_stretch_level: input.allow_stretch_level ?? false,
  });

  if (
    input.grade_band &&
    !normalizeGradeLevelStorage(input.grade_level) &&
    !isFamilyGradeBand(input.grade_band) &&
    !isMirandaGradeBand(input.grade_band)
  ) {
    return { success: false, error: 'Invalid grade band.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    updateLocalParticipantGrade(id, settings);
    notifyGradeSaved(id);
    return { success: true, warning: 'Saved locally. Grade will sync when Supabase is available.' };
  }

  try {
    if (hasFamilyCompatibilitySession() && settings.grade_level) {
      await updateFamilyCompatibilityParticipantGrade({
        participantId: id,
        gradeLevel: settings.grade_level,
        allowStretchLevel: settings.allow_stretch_level,
      });
      updateLocalParticipantGrade(id, settings);
      notifyGradeSaved(id);
      return { success: true };
    }

    const payload: Record<string, unknown> = {
      grade_band: settings.grade_band,
      allow_stretch_level: settings.allow_stretch_level,
    };
    if (settings.grade_level) {
      payload.grade_level = settings.grade_level;
    }

    const { error } = await supabase.from('participants').update(payload).eq('id', id);

    if (error) {
      if (isMissingGradeColumnError(error.message)) {
        updateLocalParticipantGrade(id, settings);
        notifyGradeSaved(id);
        return {
          success: true,
          warning:
            'Grade saved locally. Run supabase/participants_grade_level.sql in Supabase.',
        };
      }
      return { success: false, error: error.message };
    }

    updateLocalParticipantGrade(id, settings);
    notifyGradeSaved(id);
    return { success: true };
  } catch (caught) {
    if (process.env.NODE_ENV === 'development') {
      const error = caught as Error & { status?: number; correlationId?: string | null };
      console.warn('[PARTICIPANT_GRADE_SAVE]', {
        route: hasFamilyCompatibilitySession() ? 'family_compatibility_endpoint' : 'direct_client',
        status: error?.status ?? null,
        code: error?.message || 'unknown_error',
        correlationId: error?.correlationId ?? null,
        participantIdSuffix: id.slice(-6),
      });
    }
    return { success: false, error: 'Could not save grade level.' };
  }
}

export async function saveParticipantGradeLevel(
  participantId: string,
  gradeLevel: GradeLevel,
): Promise<{ success: boolean; error?: string; warning?: string }> {
  return saveParticipantGradeSettings(participantId, {
    grade_level: gradeLevel,
    allow_stretch_level: false,
  });
}
