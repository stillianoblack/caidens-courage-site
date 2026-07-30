// eslint-disable-next-line @typescript-eslint/no-var-requires
const { buildAcademyOutcomes } = require('../../../netlify/functions/_lib/academyOutcomes');
export {};

const programs = [
  { id: 'p1', program_code: 'CAMP-1', program_name: 'Camp One', program_type: 'camp', pilot_status: 'active', organization: 'Org One' },
  { id: 'p2', program_code: 'FAMILY-1', program_name: 'Family One', program_type: 'independent_family', pilot_status: 'active', organization: 'Family' },
];

function data(): any {
  return {
    programs,
    participants: [
      { id: 's1', program_code: 'CAMP-1', role: 'student', grade_level: '3' },
      { id: 's2', program_code: 'FAMILY-1', role: 'student', grade_level: '4' },
      { id: 'test-1', program_code: 'CAMP-1', role: 'student', first_name: 'Synthetic Test' },
    ],
    sessions: [
      { id: 'a', participant_id: 's1', started_at: '2026-07-01T12:00:00Z' },
      { id: 'b', participant_id: 's1', started_at: '2026-07-01T18:00:00Z' },
      { id: 'c', participant_id: 's1', started_at: '2026-07-02T12:00:00Z' },
      { id: 'd', participant_id: 's1', started_at: '2026-07-03T12:00:00Z' },
    ],
    modules: [
      { id: 'm1', participant_id: 's1', module_id: 'reading-1', completed_at: '2026-07-02T13:00:00Z', percent_score: 80 },
      { id: 'm2', participant_id: 's1', module_id: 'sel-1', completed_at: '2026-07-03T13:00:00Z', percent_score: 90 },
    ],
    missions: [],
    questions: [],
    assessments: [],
    weeks: [],
    wallets: [],
    rewards: [],
    overrides: [],
  };
}

describe('Academy reporting eligibility', () => {
  test('uses normalized distinct dates and canonical completed activities', () => {
    const result = buildAcademyOutcomes(data());
    const eligible = result.cohort.find((row: { participantId: string }) => row.participantId === 's1');
    expect(eligible).toEqual(expect.objectContaining({
      distinctActiveDays: 3,
      completedRecognizedActivities: 2,
      automaticEligible: true,
      included: true,
    }));
    expect(result.cohortSummary.programsRepresented).toBe(1);
  });

  test('force include and force exclude do not alter activity evidence', () => {
    const input = data();
    input.overrides = [
      { participant_id: 's2', reporting_override: 'include', reporting_override_reason: 'documented history' },
      { participant_id: 's1', reporting_override: 'exclude', reporting_override_reason: 'guardian request' },
    ];
    const result = buildAcademyOutcomes(input);
    expect(result.cohort.find((row: { participantId: string }) => row.participantId === 's2')).toEqual(
      expect.objectContaining({ automaticEligible: false, included: true, reportingOverride: 'include' }),
    );
    expect(result.cohort.find((row: { participantId: string }) => row.participantId === 's1')).toEqual(
      expect.objectContaining({ automaticEligible: true, included: false, reportingOverride: 'exclude' }),
    );
  });

  test('excludes test/synthetic identities even when activity exists', () => {
    const input = data();
    input.sessions.push(
      { id: 't1', participant_id: 'test-1', started_at: '2026-07-01T12:00:00Z' },
      { id: 't2', participant_id: 'test-1', started_at: '2026-07-02T12:00:00Z' },
      { id: 't3', participant_id: 'test-1', started_at: '2026-07-03T12:00:00Z' },
    );
    input.modules.push(
      { id: 'tm1', participant_id: 'test-1', module_id: 'one', completed_at: '2026-07-02T13:00:00Z', percent_score: 100 },
      { id: 'tm2', participant_id: 'test-1', module_id: 'two', completed_at: '2026-07-03T13:00:00Z', percent_score: 100 },
    );
    const result = buildAcademyOutcomes(input);
    expect(result.cohort.find((row: { participantId: string }) => row.participantId === 'test-1')).toEqual(
      expect.objectContaining({ testSynthetic: true, included: false }),
    );
  });

  test('keeps directional activity separate from verified growth', () => {
    const result = buildAcademyOutcomes(data());
    expect(result.aggregate.missionCount).toBe(2);
    expect(result.aggregate.impactSnapshot.overallMatchedGrowth.deltaPercentagePoints).toBeNull();
    expect(result.aggregate.impactSnapshot.overallMatchedGrowth.displayStatus).toBe('Not enough data');
  });
});
