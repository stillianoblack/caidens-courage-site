import { playerProgressRowsToDisplayModuleResults } from './familyPlayerProgressDisplay';
import type { LocalModuleResultRecord } from './pilotTrackingLocalStorage';

const LONDON_VISIBLE_ID = '1416658d-dc22-4fa3-a48d-c415d12d2a69';

describe('playerProgressRowsToDisplayModuleResults', () => {
  it('turns existing player progress into family display module completions', () => {
    const rows = playerProgressRowsToDisplayModuleResults({
      programCode: 'FAMILY-STILLS-2026',
      rows: [
        {
          id: 'progress-1',
          participant_id: LONDON_VISIBLE_ID,
          week_id: 'week-1',
          mission_id: 'miranda-week-1',
          character_id: 'miranda',
          mission_title: 'The Missing Schedule',
          completed_at: '2026-06-28T12:00:00.000Z',
        },
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      participant_id: LONDON_VISIBLE_ID,
      role: 'student',
      program_code: 'FAMILY-STILLS-2026',
      module_id: 'miranda-week-1',
      module_title: 'The Missing Schedule',
      character: 'miranda',
      score: 1,
      max_score: 1,
      percent_score: 100,
      completed_at: '2026-06-28T12:00:00.000Z',
    });
    expect(rows[0].answers_json).toMatchObject({
      source: 'player_progress',
      mission_id: 'miranda-week-1',
      week_id: 'week-1',
    });
  });

  it('does not duplicate progress when an equivalent module result already exists', () => {
    const existing: LocalModuleResultRecord = {
      id: 'module-1',
      participant_id: LONDON_VISIBLE_ID,
      role: 'student',
      program_code: 'FAMILY-STILLS-2026',
      module_id: 'miranda-week-1',
      module_title: 'The Missing Schedule',
      character: 'miranda',
      skill_area: 'reading',
      score: 1,
      max_score: 1,
      percent_score: 100,
      attempt_number: 1,
      completed_at: '2026-06-28T12:00:00.000Z',
      answers_json: {
        mission_id: 'miranda-week-1',
      },
    };

    const rows = playerProgressRowsToDisplayModuleResults({
      programCode: 'FAMILY-STILLS-2026',
      existingModuleResults: [existing],
      rows: [
        {
          id: 'progress-1',
          participant_id: LONDON_VISIBLE_ID,
          week_id: 'week-1',
          mission_id: 'miranda-week-1',
          character_id: 'miranda',
          mission_title: 'The Missing Schedule',
          completed_at: '2026-06-28T12:00:00.000Z',
        },
      ],
    });

    expect(rows).toEqual([]);
  });
});
