const { buildLiveLearningSnapshot } = require('./pilotLiveLearningSignals');
const BASELINE_TYPES = new Set(['baseline', 'child_baseline', 'adult_pre']);
const POST_TYPES = new Set(['final', 'post', 'post_assessment', 'adult_post']);
const MIN_MATCHED_DOMAIN_STUDENTS = 1;
const SMALL_SAMPLE_THRESHOLD = 5;
const IMPACT_DOMAINS = [
  {
    key: 'reading',
    label: 'Reading comprehension',
    field: 'reading_score',
    rawMaximum: 5,
    source: 'Canonical B-4 reading score',
  },
  {
    key: 'sel',
    label: 'SEL growth',
    field: 'confidence_score',
    rawMaximum: 50,
    source: 'Canonical B-4 feelings/SEL score',
  },
  {
    key: 'focus',
    label: 'Focus / executive-function growth',
    field: 'focus_score',
    rawMaximum: 5,
    source: 'Canonical B-4 focus-moves score',
  },
];
const CATEGORY_FIELDS = [
  ['emotional_awareness_score', 'Emotional awareness'],
  ['decision_making_score', 'Decision making'],
  ['communication_score', 'Communication'],
  ['teamwork_score', 'Teamwork'],
  ['problem_solving_score', 'Problem solving'],
  ['focus_score', 'Focus/self-regulation'],
  ['perseverance_score', 'Perseverance/resilience'],
  ['confidence_score', 'Courage/confidence'],
  ['reading_score', 'Reading comprehension'],
  ['understanding_score', 'Reading comprehension'],
];

function numberOrNull(value) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function timestamp(value) {
  const time = Date.parse(String(value || ''));
  return Number.isFinite(time) ? time : 0;
}

function latestIso(values) {
  const latest = values.map(timestamp).filter(Boolean).sort((a, b) => b - a)[0];
  return latest ? new Date(latest).toISOString() : null;
}

function round(value, places = 1) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

function scorePercent(row) {
  const explicit = numberOrNull(row?.percent_score);
  if (explicit !== null) return explicit >= 0 && explicit <= 100 ? explicit : null;
  const total = numberOrNull(row?.total_score ?? row?.score);
  const max = numberOrNull(row?.max_score);
  if (total === null || max === null || max <= 0) return null;
  const percent = (total / max) * 100;
  return percent >= 0 && percent <= 100 ? percent : null;
}

function assessmentKind(row) {
  const type = String(row?.assessment_type || '').trim().toLowerCase();
  if (BASELINE_TYPES.has(type)) return 'baseline';
  if (POST_TYPES.has(type)) return 'post';
  return null;
}

function groupBy(rows, keyFn) {
  const grouped = new Map();
  for (const row of rows || []) {
    const key = keyFn(row);
    if (!key) continue;
    const list = grouped.get(key) || [];
    list.push(row);
    grouped.set(key, list);
  }
  return grouped;
}

function latestAssessment(rows, kind) {
  return rows
    .filter((row) => assessmentKind(row) === kind)
    .sort((a, b) => timestamp(b.completed_at ?? b.created_at) - timestamp(a.completed_at ?? a.created_at))[0] || null;
}

function categoryScores(row) {
  const byLabel = new Map();
  for (const [field, label] of CATEGORY_FIELDS) {
    const value = numberOrNull(row?.[field]);
    if (value === null) continue;
    const list = byLabel.get(label) || [];
    list.push(value);
    byLabel.set(label, list);
  }
  return Object.fromEntries([...byLabel].map(([label, values]) => [label, average(values)]));
}

function domainObservation(row, definition) {
  const value = numberOrNull(row?.[definition.field]);
  if (value === null || value < 0) return null;
  if (value <= definition.rawMaximum) {
    return { numerator: value, denominator: definition.rawMaximum };
  }
  if (value <= 100) {
    return { numerator: value, denominator: 100 };
  }
  return null;
}

function buildDomainOutcome(definition, studentRows) {
  const baselineObservations = studentRows
    .map((row) => domainObservation(row.baseline, definition))
    .filter(Boolean);
  const postObservations = studentRows
    .map((row) => domainObservation(row.post, definition))
    .filter(Boolean);
  const pairs = studentRows
    .map((row) => ({
      baseline: domainObservation(row.baseline, definition),
      post: domainObservation(row.post, definition),
    }))
    .filter((row) => row.baseline && row.post);
  const baselineNumerator = baselineObservations.reduce((sum, row) => sum + row.numerator, 0);
  const baselineDenominator = baselineObservations.reduce((sum, row) => sum + row.denominator, 0);
  const postNumerator = postObservations.reduce((sum, row) => sum + row.numerator, 0);
  const postDenominator = postObservations.reduce((sum, row) => sum + row.denominator, 0);
  const baselinePercentage = baselineDenominator
    ? round((baselineNumerator / baselineDenominator) * 100)
    : null;
  const postPercentage = postDenominator ? round((postNumerator / postDenominator) * 100) : null;
  const deltaPercentagePoints =
    baselinePercentage !== null && postPercentage !== null
      ? round(postPercentage - baselinePercentage)
      : null;
  const missingBaseline = studentRows.filter(
    (row) => !domainObservation(row.baseline, definition),
  ).length;
  const missingPost = studentRows.filter((row) => !domainObservation(row.post, definition)).length;
  const matchedStudentCount = pairs.length;
  let missingReason = null;
  if (!studentRows.length) missingReason = 'No participants are available.';
  else if (!matchedStudentCount && baselineObservations.length && !postObservations.length) {
    missingReason = 'A mapped post domain score is missing.';
  } else if (!matchedStudentCount && postObservations.length && !baselineObservations.length) {
    missingReason = 'A mapped baseline domain score is missing.';
  } else if (!matchedStudentCount && missingBaseline && missingPost) {
    missingReason = 'Baseline and post domain scores are missing or not mapped.';
  } else if (matchedStudentCount < MIN_MATCHED_DOMAIN_STUDENTS) {
    missingReason = 'Participant matching is incomplete.';
  }
  const available = matchedStudentCount >= MIN_MATCHED_DOMAIN_STUDENTS;
  const displayStatus = !available
    ? 'Not enough data'
    : matchedStudentCount < SMALL_SAMPLE_THRESHOLD
      ? 'Directional result'
      : deltaPercentagePoints >= 10
        ? 'Strong growth'
        : deltaPercentagePoints > 0
          ? 'Positive growth'
          : deltaPercentagePoints === 0
            ? 'No measurable change'
            : 'Needs attention';
  return {
    key: definition.key,
    label: definition.label,
    source: definition.source,
    baselineNumerator: round(baselineNumerator, 2),
    baselineDenominator: round(baselineDenominator, 2),
    postNumerator: round(postNumerator, 2),
    postDenominator: round(postDenominator, 2),
    baselinePercentage,
    postPercentage,
    deltaPercentagePoints: available ? deltaPercentagePoints : null,
    matchedStudentCount,
    requiredMatchedCount: MIN_MATCHED_DOMAIN_STUDENTS,
    excludedRecordCount: studentRows.length - matchedStudentCount,
    dataQualityStatus: available
      ? matchedStudentCount < SMALL_SAMPLE_THRESHOLD
        ? 'Directional - small sample'
        : 'Available'
      : 'Not enough data',
    displayStatus,
    missingReason,
  };
}

function buildImpactSnapshot(studentRows, weeklyCompletion, baseline, post) {
  const domains = IMPACT_DOMAINS.map((definition) => buildDomainOutcome(definition, studentRows));
  const validDomains = domains.filter((domain) => domain.deltaPercentagePoints !== null);
  const overallDelta = average(validDomains.map((domain) => domain.deltaPercentagePoints));
  const participationCount = studentRows.filter(
    (row) => row.baselineScore !== null || row.postScore !== null,
  ).length;
  const participationTotal = studentRows.length;
  return {
    domains,
    weeklyCompletion: {
      numerator: weeklyCompletion.count,
      denominator: weeklyCompletion.total,
      percentage: weeklyCompletion.rate,
      dataQualityStatus: weeklyCompletion.rate === null ? 'Not enough data' : 'Available',
      displayStatus:
        weeklyCompletion.rate === null
          ? 'Not enough data'
          : weeklyCompletion.rate >= 75
            ? 'On track'
            : 'Needs attention',
      missingReason:
        weeklyCompletion.rate === null
          ? 'Published-week denominator or weekly progress data is missing.'
          : null,
    },
    participation: {
      numerator: participationCount,
      denominator: participationTotal,
      percentage: participationTotal ? round((participationCount / participationTotal) * 100) : null,
      dataQualityStatus: participationTotal ? 'Available' : 'Not enough data',
      displayStatus:
        !participationTotal
          ? 'Not enough data'
          : (participationCount / participationTotal) * 100 >= 75
            ? 'On track'
            : 'Needs attention',
      missingReason: participationTotal ? null : 'No participants are available.',
      baselineCompleted: baseline.count,
      postCompleted: post.count,
    },
    overallMatchedGrowth: {
      deltaPercentagePoints: round(overallDelta),
      includedDomainCount: validDomains.length,
      totalDomainCount: domains.length,
      matchedStudentCount: validDomains.length
        ? Math.min(...validDomains.map((domain) => domain.matchedStudentCount))
        : 0,
      requiredMatchedCount: MIN_MATCHED_DOMAIN_STUDENTS,
      weighting: 'Unweighted average of domains with valid matched pre/post data',
      dataQualityStatus:
        validDomains.length === 0
          ? 'Not enough data'
          : validDomains.some((domain) => domain.matchedStudentCount < SMALL_SAMPLE_THRESHOLD)
            ? 'Directional - small sample'
            : 'Available',
      displayStatus:
        validDomains.length === 0
          ? 'Not enough data'
          : validDomains.some((domain) => domain.matchedStudentCount < SMALL_SAMPLE_THRESHOLD)
            ? 'Directional result'
            : overallDelta >= 10
              ? 'Strong growth'
              : overallDelta > 0
                ? 'Positive growth'
                : overallDelta === 0
                  ? 'No measurable change'
                  : 'Needs attention',
      missingReason:
        validDomains.length === 0 ? 'No domain has valid matched baseline and post data.' : null,
    },
  };
}

function sanitizeGrade(participant) {
  return String(participant.grade_level || participant.grade_band || 'Not provided').trim() || 'Not provided';
}

function participantOutcome(participant, assessments, engagement) {
  const baselineRows = assessments.filter((row) => assessmentKind(row) === 'baseline');
  const postRows = assessments.filter((row) => assessmentKind(row) === 'post');
  const baseline = latestAssessment(assessments, 'baseline');
  const post = latestAssessment(assessments, 'post');
  const baselineScore = scorePercent(baseline);
  const postScore = scorePercent(post);
  const matched = baselineScore !== null && postScore !== null;
  const status = matched
    ? 'Matched'
    : baselineScore !== null
      ? 'Baseline only'
      : postScore !== null
        ? 'Post only'
        : 'Not enough data';
  const completionTimes = [
    ...assessments.map((row) => row.completed_at || row.created_at),
    ...engagement.modules.map((row) => row.completed_at || row.created_at),
    ...engagement.weeks.map((row) => row.completed_at || row.updated_at || row.created_at),
    ...engagement.sessions.map(
      (row) => row.last_activity_at || row.ended_at || row.updated_at || row.started_at || row.created_at,
    ),
  ];
  return {
    participantId: participant.id,
    grade: sanitizeGrade(participant),
    baseline,
    post,
    baselineScore,
    postScore,
    delta: matched ? round(postScore - baselineScore) : null,
    status,
    duplicateBaseline: baselineRows.length > 1,
    duplicatePost: postRows.length > 1,
    invalidScoreCount: assessments.filter((row) => {
      const hasScore = row.percent_score != null || row.total_score != null || row.score != null;
      return hasScore && scorePercent(row) === null;
    }).length,
    weeklyAdventuresCompleted: new Set(engagement.weeks.map((row) => row.week_number ?? row.week_id).filter(Boolean)).size,
    assessmentsCompleted: assessments.filter((row) => assessmentKind(row)).length,
    missionsCompleted: new Set(engagement.modules.map((row) => row.mission_id || row.module_id || row.id).filter(Boolean)).size,
    kidPlaySessions: engagement.sessions.length,
    focusCoins: engagement.wallets.reduce((sum, row) => sum + (numberOrNull(row.total_coins ?? row.balance ?? row.coins ?? row.amount) || 0), 0),
    certificates: engagement.rewards.filter((row) => /certificate/i.test(String(row.reward_type || row.reward_key || row.reward_name || ''))).length,
    lastActivity: latestIso(completionTimes),
    categoryBaseline: baseline ? categoryScores(baseline) : {},
    categoryPost: post ? categoryScores(post) : {},
  };
}

function buildProgramOutcome(program, data, options = {}) {
  const participants = (data.participants || []).filter(
    (row) => row.program_code === program.program_code && (!row.role || row.role === 'student'),
  );
  const participantIds = new Set(participants.map((row) => row.id));
  const assessmentsByParticipant = groupBy(
    (data.assessments || []).filter((row) => participantIds.has(row.participant_id)),
    (row) => row.participant_id,
  );
  const modulesByParticipant = groupBy(
    (data.modules || []).filter((row) => participantIds.has(row.participant_id)),
    (row) => row.participant_id,
  );
  const weeksByParticipant = groupBy(
    (data.weeks || []).filter((row) => participantIds.has(row.participant_id)),
    (row) => row.participant_id,
  );
  const walletsByParticipant = groupBy(
    (data.wallets || []).filter((row) => participantIds.has(row.participant_id)),
    (row) => row.participant_id,
  );
  const rewardsByParticipant = groupBy(
    (data.rewards || []).filter((row) => participantIds.has(row.participant_id)),
    (row) => row.participant_id,
  );
  const sessionsByParticipant = groupBy(
    (data.sessions || []).filter((row) => participantIds.has(row.participant_id)),
    (row) => row.participant_id,
  );
  const studentRows = participants.map((participant) =>
    participantOutcome(
      participant,
      assessmentsByParticipant.get(participant.id) || [],
      {
        modules: modulesByParticipant.get(participant.id) || [],
        weeks: weeksByParticipant.get(participant.id) || [],
        wallets: walletsByParticipant.get(participant.id) || [],
        rewards: rewardsByParticipant.get(participant.id) || [],
        sessions: sessionsByParticipant.get(participant.id) || [],
      },
    ),
  );
  const matched = studentRows.filter((row) => row.status === 'Matched');
  const baselineAverage = average(matched.map((row) => row.baselineScore));
  const postAverage = average(matched.map((row) => row.postScore));
  const absoluteDelta =
    baselineAverage !== null && postAverage !== null ? postAverage - baselineAverage : null;
  const percentageDelta =
    baselineAverage !== null && baselineAverage !== 0 && absoluteDelta !== null
      ? (absoluteDelta / baselineAverage) * 100
      : null;
  const publishedWeeks = Math.max(0, Number(options.publishedWeeks || 0));
  const programWeekRows = (data.weeks || []).filter((row) => participantIds.has(row.participant_id));
  const observedWeekCount = new Set(
    programWeekRows.map((row) => String(row.week_id || row.week_number || '').trim()).filter(Boolean),
  ).size;
  const effectivePublishedWeeks = Math.max(publishedWeeks, observedWeekCount);
  const completedStudentWeeks = studentRows.reduce((sum, row) => sum + row.weeklyAdventuresCompleted, 0);
  const possibleStudentWeeks = participants.length * effectivePublishedWeeks;
  const gradeDistribution = Object.entries(
    studentRows.reduce((result, row) => {
      result[row.grade] = (result[row.grade] || 0) + 1;
      return result;
    }, {}),
  ).map(([grade, count]) => ({ grade, count }));
  const categoryLabels = [...new Set(matched.flatMap((row) => Object.keys(row.categoryBaseline)))];
  const categories = categoryLabels.map((label) => {
    const pairs = matched
      .map((row) => [row.categoryBaseline[label], row.categoryPost[label]])
      .filter(([baselineValue, postValue]) => Number.isFinite(baselineValue) && Number.isFinite(postValue));
    const baselineCategoryAverage = average(pairs.map(([value]) => value));
    const postCategoryAverage = average(pairs.map(([, value]) => value));
    return {
      category: label,
      baselineAverage: round(baselineCategoryAverage),
      postAverage: round(postCategoryAverage),
      delta:
        baselineCategoryAverage !== null && postCategoryAverage !== null
          ? round(postCategoryAverage - baselineCategoryAverage)
          : null,
      n: pairs.length,
      state: pairs.length ? 'Matched' : 'Not enough data',
    };
  });
  const lastActivity = latestIso([
    program.created_at,
    ...studentRows.map((row) => row.lastActivity),
  ]);
  const quality = {
    missingBaseline: studentRows.filter((row) => row.baselineScore === null).length,
    missingPost: studentRows.filter((row) => row.postScore === null).length,
    unmatchedRecords: studentRows.filter((row) => row.status !== 'Matched').length,
    duplicateAssessmentWarnings: studentRows.filter((row) => row.duplicateBaseline || row.duplicatePost).length,
    invalidScoreRanges: studentRows.reduce((sum, row) => sum + row.invalidScoreCount, 0),
    studentsWithoutGrade: studentRows.filter((row) => row.grade === 'Not provided').length,
    programWithoutStartDate: !program.start_date && !program.pilot_start_date,
    staleProgram:
      String(program.pilot_status || '') === 'active' &&
      timestamp(lastActivity) > 0 &&
      Date.now() - timestamp(lastActivity) > 30 * 24 * 60 * 60 * 1000,
  };
  const reportBlockers = [];
  if (!matched.length) reportBlockers.push('No matched baseline and post-assessment records');
  if (quality.invalidScoreRanges) reportBlockers.push('Invalid assessment score ranges');
  if (!program.start_date && !program.pilot_start_date) reportBlockers.push('Program start date is missing');
  const baselineCompletion = {
    count: studentRows.filter((row) => row.baselineScore !== null).length,
    total: participants.length,
  };
  const postCompletion = {
    count: studentRows.filter((row) => row.postScore !== null).length,
    total: participants.length,
  };
  const weeklyCompletion = {
    count: completedStudentWeeks,
    total: possibleStudentWeeks,
    rate: possibleStudentWeeks ? round((completedStudentWeeks / possibleStudentWeeks) * 100) : null,
  };
  const weeklyProgressSourceAvailable = options.weeklyProgressSourceAvailable !== false;
  const activeCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const activeStudentCountThisWeek = studentRows.filter(
    (row) => row.lastActivity && timestamp(row.lastActivity) >= activeCutoff,
  ).length;
  const impactSnapshot = buildImpactSnapshot(
    studentRows,
    weeklyCompletion,
    baselineCompletion,
    postCompletion,
  );
  const programModules = (data.modules || []).filter((row) => participantIds.has(row.participant_id));
  const liveLearningSnapshot = buildLiveLearningSnapshot({
    modules: programModules,
    participantIds,
    weeklyCompletion,
    weekRows: programWeekRows,
    participation: impactSnapshot.participation,
    participantCount: participants.length,
    weeklyProgressSourceAvailable,
  });
  return {
    id: program.id,
    programName: program.program_name,
    programType: program.program_type,
    facilitator: program.admin_first_name || 'Not provided',
    status: program.pilot_status,
    startDate: program.start_date || program.pilot_start_date || null,
    activeStudentCount: participants.length,
    baseline: baselineCompletion,
    post: postCompletion,
    matchedCount: matched.length,
    baselineAverage: round(baselineAverage),
    postAverage: round(postAverage),
    absoluteDelta: round(absoluteDelta),
    percentageDelta: round(percentageDelta),
    percentageDeltaAvailable: percentageDelta !== null,
    weeklyCompletion,
    weeklyProgressSourceAvailable,
    impactSnapshot,
    verifiedGrowthSnapshot: impactSnapshot,
    liveLearningSnapshot,
    certificateCount: studentRows.reduce((sum, row) => sum + row.certificates, 0),
    focusCoins: studentRows.reduce((sum, row) => sum + row.focusCoins, 0),
    assessmentCount: studentRows.reduce((sum, row) => sum + row.assessmentsCompleted, 0),
    missionCount: studentRows.reduce((sum, row) => sum + row.missionsCompleted, 0),
    studentsWithAdventureCount: studentRows.filter((row) => row.missionsCompleted > 0).length,
    activeStudentCountThisWeek,
    lastActivity,
    reportStatus: reportBlockers.length ? 'Blocked' : 'Ready',
    reportBlockers,
    categories,
    gradeDistribution,
    quality,
    students: studentRows.map((row, index) => ({
      studentLabel: `Student ${String(index + 1).padStart(3, '0')}`,
      grade: row.grade,
      baselineScore: row.baselineScore,
      postScore: row.postScore,
      delta: row.delta,
      weeklyAdventuresCompleted: row.weeklyAdventuresCompleted,
      assessmentsCompleted: row.assessmentsCompleted,
      missionsCompleted: row.missionsCompleted,
      kidPlaySessions: row.kidPlaySessions,
      focusCoins: row.focusCoins,
      certificates: row.certificates,
      lastActivity: row.lastActivity,
      dataCompleteness: row.status,
    })),
  };
}

function portfolioSummary(programs) {
  const active = programs.filter((program) => program.status === 'active');
  const studentTotal = programs.reduce((sum, program) => sum + program.activeStudentCount, 0);
  const completionRates = programs.map((program) => program.weeklyCompletion.rate).filter(Number.isFinite);
  return {
    totalActivePilots: active.length,
    totalEnrolledStudents: studentTotal,
    completedBaseline: programs.reduce((sum, program) => sum + program.baseline.count, 0),
    completedPost: programs.reduce((sum, program) => sum + program.post.count, 0),
    matchedStudents: programs.reduce((sum, program) => sum + program.matchedCount, 0),
    averageProgramCompletionRate: round(average(completionRates)),
    averageWeeklyAdventureCompletion: round(average(completionRates)),
    totalCompletedAssessments: programs.reduce((sum, program) => sum + program.assessmentCount, 0),
    totalCertificatesEarned: programs.reduce((sum, program) => sum + program.certificateCount, 0),
    totalFocusCoinsEarned: programs.reduce((sum, program) => sum + program.focusCoins, 0),
    mostRecentActivity: latestIso(programs.map((program) => program.lastActivity)),
  };
}

function buildPilotOutcomes(data, options = {}) {
  const programs = (data.programs || []).map((program) => buildProgramOutcome(program, data, options));
  return { summary: portfolioSummary(programs), programs };
}

module.exports = {
  assessmentKind,
  buildPilotOutcomes,
  buildProgramOutcome,
  portfolioSummary,
  scorePercent,
  buildDomainOutcome,
  buildImpactSnapshot,
  buildLiveLearningSnapshot,
  IMPACT_DOMAINS,
};
