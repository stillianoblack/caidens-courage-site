import { isSupabaseConfigured, supabase } from './supabaseClient';

function weekNumberFromId(weekId: string): number | null {
  const match = /^week-(\d+)$/.exec(weekId.trim());
  if (!match) return null;
  const week = Number.parseInt(match[1], 10);
  return Number.isFinite(week) && week > 0 ? week : null;
}

export async function fetchCompletedMissionIdsByWeek(
  participantId: string,
): Promise<Record<number, string[]>> {
  if (!participantId.trim() || !isSupabaseConfigured() || !supabase) {
    return {};
  }

  const { data, error } = await supabase
    .from('player_progress')
    .select('week_id, mission_id')
    .eq('participant_id', participantId.trim());

  if (error) {
    console.error('[ADVENTURE_WEEK_PROGRESS] fetch failed:', error.message);
    throw new Error(error.message);
  }

  const grouped: Record<number, string[]> = {};
  for (const row of data ?? []) {
    const week = weekNumberFromId(String(row.week_id ?? ''));
    const missionId = row.mission_id ? String(row.mission_id) : '';
    if (!week || !missionId) continue;
    if (!grouped[week]) grouped[week] = [];
    if (!grouped[week].includes(missionId)) grouped[week].push(missionId);
  }

  return grouped;
}
