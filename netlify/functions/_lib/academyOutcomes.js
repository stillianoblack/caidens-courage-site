const crypto = require('crypto');
const { buildProgramOutcome } = require('./pilotOutcomes');

const ACTIVE_DAY_THRESHOLD = 3;
const ACTIVITY_THRESHOLD = 2;
const TEST_MARKER = /\b(test|testing|synthetic|fixture|demo|internal qa|quality assurance|sandbox)\b/i;

function timestamp(value) {
  const time = Date.parse(String(value || ''));
  return Number.isFinite(time) ? time : 0;
}

function isoDate(value) {
  const time = timestamp(value);
  return time ? new Date(time).toISOString().slice(0, 10) : null;
}

function latestIso(values) {
  const times = values.map(timestamp).filter(Boolean).sort((a, b) => b - a);
  return times.length ? new Date(times[0]).toISOString() : null;
}

function earliestIso(values) {
  const times = values.map(timestamp).filter(Boolean).sort((a, b) => a - b);
  return times.length ? new Date(times[0]).toISOString() : null;
}

function groupByParticipant(rows) {
  const grouped = new Map();
  for (const row of rows || []) {
    const id = String(row.participant_id || row.child_id || '').trim();
    if (!id) continue;
    const list = grouped.get(id) || [];
    list.push(row);
    grouped.set(id, list);
  }
  return grouped;
}

function activityTime(row) {
  return (
    row.completed_at ||
    row.last_activity_at ||
    row.ended_at ||
    row.updated_at ||
    row.started_at ||
    row.created_at ||
    null
  );
}

function privacySafeId(participantId) {
  return `FFA-${crypto.createHash('sha256').update(String(participantId)).digest('hex').slice(0, 10).toUpperCase()}`;
}

function isTestOrSynthetic(participant, program) {
  const fields = [
    participant.account_type,
    participant.source,
    participant.notes,
    participant.email,
    participant.first_name,
    participant.last_name,
    participant.nickname,
    program?.program_name,
    program?.program_code,
    program?.organization,
    program?.group_name,
  ];
  return Boolean(
    participant.is_test ||
    participant.test_account ||
    participant.synthetic ||
    program?.is_test ||
    program?.synthetic ||
    fields.some((value) => TEST_MARKER.test(String(value || ''))),
  );
}

function recognizedActivityKey(row) {
  return String(
    row.mission_id ||
    row.module_id ||
    row.activity_id ||
    row.week_id ||
    row.id ||
    '',
  ).trim();
}

function overrideFor(overrides, participantId) {
  const row = (overrides || [])
    .filter((item) => item.participant_id === participantId)
    .sort((a, b) => timestamp(b.updated_at) - timestamp(a.updated_at))[0];
  const value = String(row?.reporting_override || 'automatic').toLowerCase();
  return {
    value: value === 'include' || value === 'exclude' ? value : 'automatic',
    reason: String(row?.reporting_override_reason || '').trim() || null,
  };
}

function cohortClassification({ testSynthetic, automaticEligible, distinctActiveDays, completedRecognizedActivities }) {
  if (testSynthetic) return 'test_internal';
  if (automaticEligible) return 'established';
  if (distinctActiveDays >= 2 || completedRecognizedActivities >= 1) return 'emerging';
  return 'minimal';
}

function participantCohortRow(participant, program, grouped, overrides) {
  const sessions = grouped.sessions.get(participant.id) || [];
  const modules = grouped.modules.get(participant.id) || [];
  const missions = grouped.missions.get(participant.id) || [];
  const questions = grouped.questions.get(participant.id) || [];
  const assessments = grouped.assessments.get(participant.id) || [];
  const completedRecords = [...modules, ...missions].filter(
    (row) => row.completed !== false && row.status !== 'incomplete',
  );
  const recognizedActivities = new Set(completedRecords.map(recognizedActivityKey).filter(Boolean));
  const activityTimes = [
    ...sessions.map(activityTime),
    ...completedRecords.map(activityTime),
    ...questions.map(activityTime),
    ...assessments.map(activityTime),
  ].filter(Boolean);
  const activeDays = new Set(activityTimes.map(isoDate).filter(Boolean));
  const automaticEligible =
    activeDays.size >= ACTIVE_DAY_THRESHOLD && recognizedActivities.size >= ACTIVITY_THRESHOLD;
  const testSynthetic = isTestOrSynthetic(participant, program);
  const override = overrideFor(overrides, participant.id);
  const archived = Boolean(participant.archived_at || participant.status === 'archived');
  const hasHistoricalActivity = recognizedActivities.size > 0;
  let included = automaticEligible;
  let exclusionReason = automaticEligible ? null : 'Below engagement threshold';
  if (testSynthetic) {
    included = false;
    exclusionReason = 'Test or synthetic account';
  } else if (archived && !hasHistoricalActivity) {
    included = false;
    exclusionReason = 'Archived without qualifying historical activity';
  } else if (override.value === 'include') {
    included = true;
    exclusionReason = null;
  } else if (override.value === 'exclude') {
    included = false;
    exclusionReason = override.reason || 'Manually excluded';
  }
  const row = {
    participantId: participant.id,
    studentIdentifier: privacySafeId(participant.id),
    programId: program?.id || null,
    programCode: participant.program_code || null,
    programName: program?.program_name || 'Unlinked program',
    programType: program?.program_type || 'Unknown',
    organization: program?.organization || program?.group_name || 'Unspecified',
    distinctActiveDays: activeDays.size,
    completedRecognizedActivities: recognizedActivities.size,
    assessmentCount: assessments.length,
    firstActivity: earliestIso(activityTimes),
    latestActivity: latestIso(activityTimes),
    automaticEligible,
    reportingOverride: override.value,
    reportingOverrideReason: override.reason,
    included,
    exclusionReason,
    testSynthetic,
    missingProgramLink: !program,
    missingGradeLevel: !String(participant.grade_level || participant.grade_band || '').trim(),
  };
  return {
    ...row,
    cohortClassification: cohortClassification(row),
  };
}

function buildAcademyOutcomes(data, options = {}) {
  const programsByCode = new Map(
    (data.programs || []).map((program) => [program.program_code, program]),
  );
  const grouped = {
    sessions: groupByParticipant(data.sessions),
    modules: groupByParticipant(data.modules),
    missions: groupByParticipant(data.missions),
    questions: groupByParticipant(data.questions),
    assessments: groupByParticipant(data.assessments),
  };
  const canonical = new Map();
  let duplicateIdentities = 0;
  for (const participant of (data.participants || []).filter(
    (row) => !row.role || row.role === 'student',
  )) {
    const canonicalId = String(
      participant.canonical_participant_id || participant.duplicate_of_participant_id || participant.id,
    );
    if (canonical.has(canonicalId)) {
      duplicateIdentities += 1;
      continue;
    }
    canonical.set(canonicalId, participant);
  }
  const cohort = [...canonical.values()].map((participant) =>
    participantCohortRow(
      participant,
      programsByCode.get(participant.program_code),
      grouped,
      data.overrides,
    ),
  );
  const includedIds = new Set(cohort.filter((row) => row.included).map((row) => row.participantId));
  const academyCode = 'FOCUS-FLAME-ACADEMY';
  const scoped = {
    ...data,
    participants: (data.participants || [])
      .filter((row) => includedIds.has(row.id))
      .map((row) => ({ ...row, program_code: academyCode })),
  };
  const aggregate = buildProgramOutcome(
    {
      id: 'focus-flame-academy-overview',
      program_code: academyCode,
      program_name: 'Focus Flame Academy Overview',
      program_type: 'academy_portfolio',
      pilot_status: 'active',
      start_date: earliestIso(cohort.map((row) => row.firstActivity)),
    },
    scoped,
    options,
  );
  const represented = cohort.filter((row) => row.included);
  const established = cohort.filter((row) => row.cohortClassification === 'established').length;
  const emerging = cohort.filter((row) => row.cohortClassification === 'emerging').length;
  const minimal = cohort.filter((row) => row.cohortClassification === 'minimal').length;
  const testInternal = cohort.filter((row) => row.cohortClassification === 'test_internal').length;
  const nonTestLearners = cohort.length - testInternal;
  return {
    calculatedAt: new Date().toISOString(),
    eligibilityRule: {
      distinctActiveDays: ACTIVE_DAY_THRESHOLD,
      completedRecognizedActivities: ACTIVITY_THRESHOLD,
      statement:
        'Academy-wide reporting includes students with at least three distinct active days and two completed learning activities, unless an administrator has applied a documented inclusion or exclusion override.',
    },
    cohortSummary: {
      totalParticipantAccounts: cohort.length,
      canonicalStudentAccounts: cohort.length,
      establishedParticipants: established,
      emergingParticipants: emerging,
      minimalParticipants: minimal,
      testInternalParticipants: testInternal,
      nonTestLearners,
      activeLearners: cohort.filter((row) => !row.testSynthetic && row.distinctActiveDays > 0).length,
      operationalPrograms: new Set(
        cohort.filter((row) => !row.testSynthetic).map((row) => row.programCode).filter(Boolean),
      ).size,
      automaticallyEligibleStudents: cohort.filter(
        (row) => row.automaticEligible && row.reportingOverride === 'automatic' && !row.testSynthetic,
      ).length,
      manuallyIncludedStudents: cohort.filter(
        (row) => row.included && row.reportingOverride === 'include',
      ).length,
      manuallyExcludedStudents: cohort.filter(
        (row) => !row.included && row.reportingOverride === 'exclude',
      ).length,
      lowEngagementExclusions: cohort.filter(
        (row) => !row.included && row.exclusionReason === 'Below engagement threshold',
      ).length,
      testSyntheticExcluded: cohort.filter((row) => row.testSynthetic).length,
      programsRepresented: new Set(represented.map((row) => row.programCode).filter(Boolean)).size,
      activeOrganizations: new Set(represented.map((row) => row.organization).filter(Boolean)).size,
      earliestActivity: earliestIso(represented.map((row) => row.firstActivity)),
      latestActivity: latestIso(represented.map((row) => row.latestActivity)),
    },
    dataQuality: {
      unmatchedParticipantRecords: aggregate.quality.unmatchedRecords,
      missingProgramLinks: cohort.filter((row) => row.missingProgramLink).length,
      missingGradeLevels: cohort.filter((row) => row.missingGradeLevel).length,
      duplicateIdentities,
      excludedTestSyntheticRecords: cohort.filter((row) => row.testSynthetic).length,
      studentsBelowEligibilityThreshold: cohort.filter((row) => !row.automaticEligible).length,
      stalePrograms: (data.programs || []).filter((program) => program.pilot_status === 'active')
        .filter((program) => {
          const last = latestIso(
            cohort.filter((row) => row.programCode === program.program_code).map((row) => row.latestActivity),
          );
          return last && Date.now() - timestamp(last) > 30 * 24 * 60 * 60 * 1000;
        }).length,
      missingWeeklyProgressSource: options.weeklyProgressSourceAvailable === false,
    },
    aggregate,
    cohort,
  };
}

module.exports = {
  ACTIVE_DAY_THRESHOLD,
  ACTIVITY_THRESHOLD,
  buildAcademyOutcomes,
  cohortClassification,
  isTestOrSynthetic,
  privacySafeId,
};
