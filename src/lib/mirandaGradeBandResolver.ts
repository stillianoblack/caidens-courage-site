import { isFamilyGradeBand, type FamilyGradeBand } from '../data/familyGradeBandOptions';
import { normalizeGradeLevelStorage } from '../data/gradeLevelOptions';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import {
  isMirandaGradeBand,
  type MirandaGradeBand,
} from '../types/mirandaAdaptiveQuest';
import { loadLocalParticipants } from './pilotTrackingLocalStorage';
import { mergeLocalParticipantGradeOverrides } from './pilotTrackingLocalStorage';
import { fetchParticipantsByIds } from './studentFamilyLinkService';
import { hasCanonicalGradeLevel } from './participantGradeDisplay';
import { resolveAdaptiveGradeBand } from './getGradeBand';

export type MirandaGradeBandResolution = {
  band: MirandaGradeBand;
  /** @deprecated Use band */
  bandKey: MirandaGradeBand;
  missingGrade: boolean;
  needsGradeSelection: boolean;
  familyGradeBand: FamilyGradeBand | null;
  allowStretch: boolean;
};

export type ParticipantGradeSettingsSnapshot = {
  gradeLevel: string | null;
  gradeBand: string | null;
  allowStretch: boolean;
};

function mergeGradeSnapshot(
  remote: { grade_level?: string | null; grade_band?: string | null; allow_stretch_level?: boolean | null },
  local?: { grade_level?: string; grade_band?: string; allow_stretch_level?: boolean },
): ParticipantGradeSettingsSnapshot {
  const rawLevel = remote.grade_level?.trim() || local?.grade_level?.trim() || null;
  const normalizedLevel = normalizeGradeLevelStorage(rawLevel);
  return {
    gradeLevel: normalizedLevel ?? rawLevel,
    gradeBand: remote.grade_band?.trim() || local?.grade_band?.trim() || null,
    allowStretch: remote.allow_stretch_level ?? local?.allow_stretch_level ?? false,
  };
}

export async function readParticipantGradeSettingsAsync(
  participantId?: string,
): Promise<ParticipantGradeSettingsSnapshot> {
  const id = participantId?.trim() || readActiveChildParticipantId();
  if (!id) {
    return { gradeLevel: null, gradeBand: null, allowStretch: false };
  }

  const local = loadLocalParticipants().find((row) => row.id === id);

  try {
    const remote = await fetchParticipantsByIds([id]);
    const participant = mergeLocalParticipantGradeOverrides(remote.participants)[0];
    if (participant) {
      return mergeGradeSnapshot(participant, local);
    }
  } catch {
    /* use local */
  }

  return mergeGradeSnapshot({}, local);
}

export function readParticipantGradeSettings(participantId?: string): ParticipantGradeSettingsSnapshot {
  const id = participantId?.trim() || readActiveChildParticipantId();
  if (!id) {
    return { gradeLevel: null, gradeBand: null, allowStretch: false };
  }

  const participant = loadLocalParticipants().find((row) => row.id === id);
  return mergeGradeSnapshot(participant ?? {}, participant);
}

export function resolveMirandaGradeBandForParticipant(
  participantId?: string,
): MirandaGradeBandResolution {
  const { gradeLevel, gradeBand, allowStretch } = readParticipantGradeSettings(participantId);
  const familyGradeBand = gradeBand && isFamilyGradeBand(gradeBand) ? gradeBand : null;
  const hasLevel = hasCanonicalGradeLevel(gradeLevel);
  const hasBand = Boolean(gradeBand?.trim());

  const band = resolveAdaptiveGradeBand({
    gradeLevel,
    gradeBand,
    allowStretch,
  });

  return {
    band,
    bandKey: band,
    missingGrade: !hasLevel && !hasBand,
    needsGradeSelection: !hasLevel && hasBand,
    familyGradeBand,
    allowStretch,
  };
}

export function resolveMirandaGradeBandKey(input: {
  gradeLevel?: string | null;
  familyGradeBand?: string | null;
  numericGrade?: number | null;
  allowStretch?: boolean;
}): MirandaGradeBand {
  return resolveAdaptiveGradeBand({
    gradeLevel: input.gradeLevel,
    gradeBand: input.familyGradeBand,
    numericGrade: input.numericGrade,
    allowStretch: input.allowStretch,
  });
}

export function resolveMirandaBandFromNumericGrade(grade: number): MirandaGradeBand {
  return resolveAdaptiveGradeBand({ numericGrade: grade });
}

export function canPreviewMirandaGradeBand(pathname: string): boolean {
  if (pathname.includes('/facilitator')) return true;
  if (pathname.includes('/pilot/')) return true;
  if (pathname.includes('/program-dashboard')) return true;
  if (pathname.includes('/caiden')) return true;
  return false;
}

export function readMirandaGradeBandPreviewParam(search: string): MirandaGradeBand | null {
  const params = new URLSearchParams(search);
  const raw = params.get('previewGradeBand') ?? params.get('gradeBand');
  if (!raw) return null;
  if (isMirandaGradeBand(raw)) return raw;
  if (raw === 'grades_2_3') return '2-3';
  if (raw === 'grades_4_5') return '4-5';
  return null;
}
