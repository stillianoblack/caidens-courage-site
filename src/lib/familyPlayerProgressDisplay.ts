import { listTrackedStudentModules } from '../data/moduleTrackingRegistry';
import type { LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type PlayerProgressDisplayRow = {
  id?: string | null;
  participant_id?: string | null;
  week_id?: string | null;
  mission_id?: string | null;
  character_id?: string | null;
  mission_title?: string | null;
  completed_at?: string | null;
};

function normalizeCharacter(value?: string | null): string {
  const normalized = value?.trim().toLowerCase() ?? '';
  if (normalized === 'b-4') return 'b4';
  return normalized;
}

function inferCharacterFromMission(missionId: string): string {
  const prefix = missionId.trim().toLowerCase().split(/[-_:]/)[0] ?? '';
  if (['caiden', 'miranda', 'charlie', 'b4', 'zeke'].includes(prefix)) return prefix;
  return 'caiden';
}

function resolveSkillArea(character: string): string {
  const tracked = listTrackedStudentModules().find((row) => row.character === character);
  return tracked?.skillArea ?? 'gameplay';
}

function moduleTitleFromMission(row: PlayerProgressDisplayRow, missionId: string): string {
  const title = row.mission_title?.trim();
  if (title) return title;
  return missionId
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function playerProgressRowsToDisplayModuleResults(input: {
  rows: PlayerProgressDisplayRow[];
  programCode: string;
  existingModuleResults?: LocalModuleResultRecord[];
}): LocalModuleResultRecord[] {
  const existingKeys = new Set(
    (input.existingModuleResults ?? []).map((row) => {
      const missionId =
        typeof row.answers_json?.mission_id === 'string' ? row.answers_json.mission_id : row.module_id;
      return `${row.participant_id}::${missionId}`;
    }),
  );

  const displayRows: LocalModuleResultRecord[] = [];
  for (const row of input.rows) {
    const participantId = row.participant_id?.trim() ?? '';
    const missionId = row.mission_id?.trim() ?? '';
    if (!participantId || !missionId) continue;

    const key = `${participantId}::${missionId}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);

    const character = normalizeCharacter(row.character_id) || inferCharacterFromMission(missionId);
    const completedAt = row.completed_at?.trim() || new Date(0).toISOString();

    displayRows.push({
      id: `player-progress:${row.id ?? `${participantId}:${missionId}`}`,
      participant_id: participantId,
      role: 'student',
      program_code: input.programCode,
      module_id: missionId,
      module_title: moduleTitleFromMission(row, missionId),
      character,
      skill_area: resolveSkillArea(character),
      score: 1,
      max_score: 1,
      percent_score: 100,
      attempt_number: 1,
      completed_at: completedAt,
      answers_json: {
        source: 'player_progress',
        mission_id: missionId,
        week_id: row.week_id ?? null,
      },
    });
  }

  return displayRows;
}

export async function fetchPlayerProgressDisplayModuleResults(input: {
  participantIds: string[];
  programCode: string;
  existingModuleResults?: LocalModuleResultRecord[];
}): Promise<{ results: LocalModuleResultRecord[]; error?: string }> {
  const participantIds = Array.from(
    new Set(input.participantIds.map((id) => id.trim()).filter(Boolean)),
  );
  if (!participantIds.length) return { results: [] };
  if (!isSupabaseConfigured() || !supabase) return { results: [], error: 'missing_env' };

  try {
    const { data, error } = await supabase
      .from('player_progress')
      .select('id, participant_id, week_id, mission_id, character_id, mission_title, completed_at')
      .in('participant_id', participantIds)
      .order('completed_at', { ascending: false });

    if (error) return { results: [], error: error.message };

    return {
      results: playerProgressRowsToDisplayModuleResults({
        rows: (data ?? []) as PlayerProgressDisplayRow[],
        programCode: input.programCode,
        existingModuleResults: input.existingModuleResults,
      }),
    };
  } catch {
    return { results: [], error: 'fetch_failed' };
  }
}
