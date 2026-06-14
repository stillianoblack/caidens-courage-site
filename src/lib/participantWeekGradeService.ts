import { normalizeGradeLevelStorage } from '../data/gradeLevelOptions';
import { readParticipantGradeSettingsAsync } from './mirandaGradeBandResolver';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export type WeekGradeSnapshot = {
  weekId: string;
  weekGradeLevel: string | null;
};

export async function readWeekGradeLevel(
  participantId: string | null | undefined,
  weekId: string,
): Promise<string | null> {
  if (!participantId || !isSupabaseConfigured() || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('participant_week_progress')
    .select('week_grade_level')
    .eq('participant_id', participantId)
    .eq('week_id', weekId)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WEEK_GRADE] read failed', error);
    }
    return null;
  }

  return data?.week_grade_level ?? null;
}

/** Lock week question set to current participant grade when week starts. */
export async function ensureWeekGradeLevel(
  participantId: string | null | undefined,
  weekId: string,
): Promise<string | null> {
  if (!participantId || !isSupabaseConfigured() || !supabase) {
    return null;
  }

  const existing = await readWeekGradeLevel(participantId, weekId);
  if (existing) {
    return existing;
  }

  const settings = await readParticipantGradeSettingsAsync(participantId);
  const gradeLevel = normalizeGradeLevelStorage(settings.gradeLevel);
  if (!gradeLevel) {
    return null;
  }

  const { error } = await supabase.from('participant_week_progress').upsert(
    {
      participant_id: participantId,
      week_id: weekId,
      week_grade_level: gradeLevel,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'participant_id,week_id' },
  );

  if (error && process.env.NODE_ENV === 'development') {
    console.warn('[WEEK_GRADE] save failed', error);
  }

  return gradeLevel;
}

/** Returns locked grade for a started week, or current participant grade for new weeks. */
export async function getGradeForAdventure(
  participantId: string | null | undefined,
  weekNumber: number,
): Promise<string | null> {
  const weekId = `week-${weekNumber}`;
  const locked = await readWeekGradeLevel(participantId, weekId);
  if (locked) return locked;
  const settings = await readParticipantGradeSettingsAsync(participantId ?? undefined);
  return normalizeGradeLevelStorage(settings.gradeLevel);
}
