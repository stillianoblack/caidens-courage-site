// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildPilotOutcomes, scorePercent } = require('../../../netlify/functions/_lib/pilotOutcomes');
export {};

const program = {
  id: 'program-1',
  program_name: 'Synthetic Pilot',
  program_type: 'School',
  program_code: 'SYNTHETIC',
  admin_first_name: 'Facilitator',
  pilot_status: 'active',
  created_at: '2026-01-01T00:00:00Z',
};
const participants = [
  { id: 'p1', program_code: 'SYNTHETIC', role: 'student', grade_level: '4' },
  { id: 'p2', program_code: 'SYNTHETIC', role: 'student' },
  { id: 'p3', program_code: 'SYNTHETIC', role: 'student', grade_band: '3rd–5th' },
];

describe('pilot outcomes formulas', () => {
  it('uses matched students and preserves incomplete records', () => {
    const result = buildPilotOutcomes({
      programs: [program],
      participants,
      assessments: [
        { id: 'a1', participant_id: 'p1', assessment_type: 'baseline', percent_score: 50, completed_at: '2026-01-02' },
        { id: 'a2', participant_id: 'p1', assessment_type: 'post', percent_score: 75, completed_at: '2026-02-02' },
        { id: 'a3', participant_id: 'p2', assessment_type: 'baseline', percent_score: 80, completed_at: '2026-01-03' },
        { id: 'a4', participant_id: 'p3', assessment_type: 'post', percent_score: 90, completed_at: '2026-02-03' },
      ],
    });
    const outcome = result.programs[0];
    expect(outcome.matchedCount).toBe(1);
    expect(outcome.baselineAverage).toBe(50);
    expect(outcome.postAverage).toBe(75);
    expect(outcome.absoluteDelta).toBe(25);
    expect(outcome.percentageDelta).toBe(50);
    expect(outcome.students.map((row: { dataCompleteness: string }) => row.dataCompleteness)).toEqual([
      'Matched',
      'Baseline only',
      'Post only',
    ]);
    expect(outcome.quality.unmatchedRecords).toBe(2);
  });

  it('makes percentage delta unavailable when baseline is zero', () => {
    const outcome = buildPilotOutcomes({
      programs: [program],
      participants: [participants[0]],
      assessments: [
        { participant_id: 'p1', assessment_type: 'baseline', percent_score: 0 },
        { participant_id: 'p1', assessment_type: 'post', percent_score: 20 },
      ],
    }).programs[0];
    expect(outcome.absoluteDelta).toBe(20);
    expect(outcome.percentageDelta).toBeNull();
    expect(outcome.percentageDeltaAvailable).toBe(false);
  });

  it('flags duplicates and invalid score ranges without inventing scores', () => {
    const outcome = buildPilotOutcomes({
      programs: [program],
      participants: [participants[0]],
      assessments: [
        { participant_id: 'p1', assessment_type: 'baseline', percent_score: 120, completed_at: '2026-01-01' },
        { participant_id: 'p1', assessment_type: 'baseline', percent_score: 60, completed_at: '2026-01-02' },
      ],
    }).programs[0];
    expect(outcome.quality.duplicateAssessmentWarnings).toBe(1);
    expect(outcome.quality.invalidScoreRanges).toBe(1);
    expect(scorePercent({ total_score: 4, max_score: 5 })).toBe(80);
  });

  it('returns honest empty states', () => {
    const outcome = buildPilotOutcomes({ programs: [program], participants: [] }).programs[0];
    expect(outcome.baselineAverage).toBeNull();
    expect(outcome.categories).toEqual([]);
    expect(outcome.reportStatus).toBe('Blocked');
  });
});
