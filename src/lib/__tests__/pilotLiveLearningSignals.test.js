// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  buildLiveLearningSnapshot,
  buildDomainLiveSignal,
  moduleDomain,
  liveStatusLabel,
} = require('../../../netlify/functions/_lib/pilotLiveLearningSignals');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildPilotOutcomes } = require('../../../netlify/functions/_lib/pilotOutcomes');

const program = {
  id: 'program-br',
  program_name: 'Blue Ribbon Results Academy',
  program_type: 'School',
  program_code: 'BLUERIBBON',
  admin_first_name: 'Facilitator',
  pilot_status: 'active',
  start_date: '2026-01-01',
};

const participants = [
  { id: 's1', program_code: 'BLUERIBBON', role: 'student', grade_level: '4' },
  { id: 's2', program_code: 'BLUERIBBON', role: 'student', grade_level: '5' },
  { id: 's3', program_code: 'BLUERIBBON', role: 'student', grade_level: '3' },
];

function participantSet(ids = ['s1', 's2', 's3']) {
  return new Set(ids);
}

describe('pilot live learning signals', () => {
  it('computes reading signal from tagged module_results', () => {
    const modules = [
      {
        participant_id: 's1',
        character: 'zeke',
        skill_area: 'Reading comprehension',
        percent_score: 80,
        module_id: 'm1',
        answers_json: { _attempts: { q1: { correct: true }, q2: { correct: false } } },
      },
      {
        participant_id: 's2',
        character: 'charlie',
        percent_score: 60,
        module_id: 'm2',
        answers_json: { _attempts: { q1: { correct: true } } },
      },
    ];
    const signal = buildDomainLiveSignal('reading', modules, participantSet());
    expect(signal.centerValue).toBe('70%');
    expect(signal.statusLabel).toBe('Positive signal');
    expect(signal.details.studentsWithActivity).toBe(2);
    expect(signal.details.missionsCompleted).toBe(2);
    expect(signal.details.questionsAnswered).toBe(3);
    expect(signal.details.correctAnswers).toBe(2);
    expect(signal.evidenceType).toBe('directional');
    expect(signal.statusLabel).not.toMatch(/growth/i);
  });

  it('computes SEL signal from miranda / SEL skill tags', () => {
    const modules = [
      { participant_id: 's1', character: 'miranda', skill_area: 'SEL', percent_score: 90, module_id: 'sel1' },
    ];
    const signal = buildDomainLiveSignal('sel', modules, participantSet(['s1']));
    expect(moduleDomain(modules[0])).toBe('sel');
    expect(signal.centerValue).toBe('90%');
    expect(signal.statusLabel).toBe('Strong signal');
    expect(signal.details.skillAreasObserved).toContain('SEL');
  });

  it('computes focus signal from b4-tagged missions', () => {
    const modules = [
      { participant_id: 's2', character: 'b4', skill_area: 'Focus', percent_score: 55, attempt_number: 2, module_id: 'f1' },
    ];
    const signal = buildDomainLiveSignal('focus', modules, participantSet(['s2']));
    expect(signal.centerValue).toBe('55%');
    expect(signal.details.averageAttempts).toBe(2);
  });

  it('shows weekly completion when week progress exists without post-assessments', () => {
    const outcome = buildPilotOutcomes({
      programs: [program],
      participants,
      assessments: [
        { participant_id: 's1', assessment_type: 'baseline', percent_score: 50, reading_score: 2 },
        { participant_id: 's2', assessment_type: 'baseline', percent_score: 55, reading_score: 3 },
      ],
      weeks: [
        { participant_id: 's1', week_id: 'week-1' },
        { participant_id: 's2', week_id: 'week-1' },
        { participant_id: 's1', week_id: 'week-2' },
      ],
      modules: [{ participant_id: 's1', program_code: 'BLUERIBBON', character: 'zeke', percent_score: 75, module_id: 'r1' }],
    }, { publishedWeeks: 2 }).programs[0];

    expect(outcome.post.count).toBe(0);
    expect(outcome.impactSnapshot.domains[0].deltaPercentagePoints).toBeNull();
    const weekly = outcome.liveLearningSnapshot.cards.find((card) => card.key === 'weekly');
    expect(weekly.available).toBe(true);
    expect(weekly.centerValue).not.toBe('Not enough data');
    expect(weekly.centerValue).toMatch(/%/);
  });

  it('excludes missing domains from overall live signal instead of treating as zero', () => {
    const snapshot = buildLiveLearningSnapshot({
      modules: [{ participant_id: 's1', character: 'zeke', percent_score: 80, module_id: 'r1' }],
      participantIds: participantSet(['s1']),
      weeklyCompletion: { count: 0, total: 0, rate: null },
      weekRows: [],
      participation: { numerator: 2, denominator: 3, percentage: 66.7, displayStatus: 'On track' },
      participantCount: 3,
    });
    const overall = snapshot.cards.find((card) => card.key === 'overall');
    expect(overall.centerValue).toBe('80%');
    expect(overall.details.includedDomainCount).toBe(1);
    expect(overall.details.denominator).toBe(1);
    expect(overall.label).toMatch(/Overall live/i);
    expect(overall.label).not.toMatch(/growth/i);
  });

  it('leaves verified growth engine unchanged on baseline-only pilots', () => {
    const outcome = buildPilotOutcomes({
      programs: [program],
      participants: [participants[0]],
      assessments: [
        { participant_id: 's1', assessment_type: 'baseline', percent_score: 50, reading_score: 2, focus_score: 1 },
      ],
      modules: [{ participant_id: 's1', program_code: 'BLUERIBBON', character: 'zeke', percent_score: 70, module_id: 'r1' }],
    }).programs[0];
    expect(outcome.liveLearningSnapshot.cards[0].available).toBe(true);
    expect(outcome.verifiedGrowthSnapshot.domains[0].deltaPercentagePoints).toBeNull();
    expect(outcome.impactSnapshot.domains[0].deltaPercentagePoints).toBeNull();
  });

  it('uses directional status labels from transparent thresholds', () => {
    expect(liveStatusLabel(82, 3)).toBe('Strong signal');
    expect(liveStatusLabel(70, 3)).toBe('Positive signal');
    expect(liveStatusLabel(55, 3)).toBe('Developing signal');
    expect(liveStatusLabel(40, 3)).toBe('Early signal');
    expect(liveStatusLabel(null, 0)).toBe('Awaiting activity');
  });
});
