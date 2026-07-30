const LIVE_DOMAINS = [
  { key: 'reading', label: 'Reading comprehension signal', domainMatch: 'reading' },
  { key: 'sel', label: 'SEL signal', domainMatch: 'sel' },
  { key: 'focus', label: 'Focus / executive-function signal', domainMatch: 'focus' },
];

function numberOrNull(value) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
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

function modulePercent(row) {
  const explicit = numberOrNull(row?.percent_score);
  if (explicit !== null && explicit >= 0 && explicit <= 100) return explicit;
  const score = numberOrNull(row?.score);
  const max = numberOrNull(row?.max_score);
  if (score === null || max === null || max <= 0) return null;
  const percent = (score / max) * 100;
  return percent >= 0 && percent <= 100 ? percent : null;
}

function moduleDomain(row) {
  const area = String(row?.skill_area || '').toLowerCase();
  const character = String(row?.character || '').toLowerCase();
  if (area.includes('read') || character === 'zeke' || character === 'charlie') return 'reading';
  if (
    area.includes('feel') ||
    area.includes('sel') ||
    area.includes('social') ||
    area.includes('emotional') ||
    character === 'miranda'
  ) {
    return 'sel';
  }
  if (
    area.includes('focus') ||
    area.includes('executive') ||
    character === 'b4' ||
    character === 'caiden'
  ) {
    return 'focus';
  }
  return null;
}

function parseQuestionStats(answersJson) {
  if (!answersJson || typeof answersJson !== 'object') {
    return { questionsAnswered: 0, correctAnswers: 0 };
  }
  const attempts = answersJson._attempts;
  if (attempts && typeof attempts === 'object') {
    const entries = Object.values(attempts);
    let questionsAnswered = 0;
    let correctAnswers = 0;
    for (const attempt of entries) {
      if (!attempt || typeof attempt !== 'object') continue;
      questionsAnswered += 1;
      if (
        attempt.correct === true ||
        attempt.isCorrect === true ||
        attempt.is_correct_final === true ||
        attempt.result === 'correct'
      ) {
        correctAnswers += 1;
      }
    }
    if (questionsAnswered) return { questionsAnswered, correctAnswers };
  }
  // Legacy answer maps do not carry a reliable correctness contract. Do not mix
  // their key counts with canonical `_attempts` correctness totals.
  return { questionsAnswered: 0, correctAnswers: 0 };
}

function liveStatusLabel(avgPercent, studentsWithActivity) {
  if (!studentsWithActivity || avgPercent == null) return 'Awaiting activity';
  if (avgPercent >= 80) return 'Strong signal';
  if (avgPercent >= 65) return 'Positive signal';
  if (avgPercent >= 50) return 'Developing signal';
  return 'Early signal';
}

function buildDomainLiveSignal(domainKey, modules, participantIds) {
  const scoped = modules.filter(
    (row) => participantIds.has(row.participant_id) && moduleDomain(row) === domainKey,
  );
  const students = new Set(scoped.map((row) => row.participant_id).filter(Boolean));
  const missionKeys = new Set(
    scoped.map((row) => row.module_id || row.mission_id || row.id).filter(Boolean),
  );
  const accuracies = scoped.map(modulePercent).filter((value) => value != null);
  const avgAccuracy = average(accuracies);
  let questionsAnswered = 0;
  let correctAnswers = 0;
  let totalAttempts = 0;
  const skillAreas = new Set();
  for (const row of scoped) {
    if (row.skill_area) skillAreas.add(String(row.skill_area));
    const stats = parseQuestionStats(row.answers_json);
    questionsAnswered += stats.questionsAnswered;
    correctAnswers += stats.correctAnswers;
    totalAttempts += numberOrNull(row.attempt_number) || 1;
  }
  const sorted = [...scoped].sort(
    (a, b) => Date.parse(a.completed_at || a.created_at || '') - Date.parse(b.completed_at || b.created_at || ''),
  );
  const earliest = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 3)));
  const latest = sorted.slice(-Math.max(1, Math.ceil(sorted.length / 3)));
  const earlyAvg = average(earliest.map(modulePercent).filter((value) => value != null));
  const lateAvg = average(latest.map(modulePercent).filter((value) => value != null));
  let trendNote = 'Trend unavailable until more mission history is recorded.';
  if (earlyAvg != null && lateAvg != null && sorted.length >= 2) {
    const delta = round(lateAvg - earlyAvg);
    if (delta == null) trendNote = 'Trend unavailable until more mission history is recorded.';
    else if (delta > 0) trendNote = `Recent activity averages ${delta} points above earliest recorded missions.`;
    else if (delta < 0) trendNote = `Recent activity averages ${Math.abs(delta)} points below earliest recorded missions.`;
    else trendNote = 'Recent activity is consistent with earliest recorded missions.';
  }

  const definition = LIVE_DOMAINS.find((row) => row.domainMatch === domainKey);
  const label = definition?.label || domainKey;
  const available = students.size > 0 && avgAccuracy != null;
  const statusLabel = liveStatusLabel(avgAccuracy, students.size);
  const centerValue = avgAccuracy == null ? 'Awaiting activity' : `${round(avgAccuracy)}%`;

  return {
    key: domainKey,
    label,
    evidenceType: 'directional',
    centerValue,
    statusLabel,
    summary: available
      ? `${students.size} students completed ${missionKeys.size} tagged missions with ${round(avgAccuracy)}% average accuracy.`
      : 'No tagged mission activity has been recorded yet for this domain.',
    details: {
      source: 'module_results (skill_area, character, percent_score, answers_json)',
      numerator: round(accuracies.reduce((sum, value) => sum + value, 0), 2),
      denominator: accuracies.length,
      includedStudents: students.size,
      excludedStudents: 0,
      dataSufficiencyRule: 'Requires at least one completed module tagged to this domain.',
      lastCalculatedAt: new Date().toISOString(),
      studentsWithActivity: students.size,
      missionsCompleted: missionKeys.size,
      questionsAnswered,
      correctAnswers,
      averageAttempts: scoped.length ? round(totalAttempts / scoped.length, 2) : null,
      skillAreasObserved: [...skillAreas],
      trendNote,
    },
    available,
  };
}

function buildWeeklyLiveSignal(
  weeklyCompletion,
  weekRows,
  participantCount,
  sourceAvailable = true,
) {
  const distinctWeeks = new Set(
    (weekRows || []).map((row) => String(row.week_id || row.week_number || '').trim()).filter(Boolean),
  );
  const denominator = weeklyCompletion.total || participantCount * distinctWeeks.size;
  const numerator = weeklyCompletion.count;
  const percentage =
    denominator > 0 ? round((numerator / denominator) * 100) : weeklyCompletion.rate;
  const available = sourceAvailable && denominator > 0;
  const unavailableSummary =
    'Weekly completion is unavailable because the canonical weekly-progress source is not deployed. Mission activity is reported separately and is not converted into a weekly rate.';
  return {
    key: 'weekly',
    label: 'Weekly completion',
    evidenceType: 'operational',
    centerValue: !sourceAvailable
      ? 'Unavailable'
      : percentage == null
        ? 'Awaiting activity'
        : `${percentage}%`,
    statusLabel: !sourceAvailable
      ? 'Source unavailable'
      : available
        ? (percentage >= 75 ? 'Strong signal' : percentage >= 50 ? 'Positive signal' : 'Developing signal')
        : 'Awaiting activity',
    summary: available
      ? `${numerator} of ${denominator} student-weeks completed across published weekly adventures.`
      : sourceAvailable
        ? 'Weekly progress has not been recorded yet.'
        : unavailableSummary,
    details: {
      source: 'participant_week_progress',
      numerator,
      denominator,
      includedStudents: participantCount,
      excludedStudents: 0,
      dataSufficiencyRule: sourceAvailable
        ? 'Counts distinct participant-week progress rows against published or observed weeks.'
        : 'No rate is calculated without the canonical participant-week denominator.',
      lastCalculatedAt: new Date().toISOString(),
      currentWeekStatus: !sourceAvailable
        ? 'Canonical weekly-progress source unavailable'
        : distinctWeeks.size
          ? `${distinctWeeks.size} week(s) observed in progress records`
          : 'No week progress rows yet',
    },
    available,
    percentage,
  };
}

function buildParticipationLiveSignal(participation) {
  return {
    key: 'participation',
    label: 'Participation',
    evidenceType: 'operational',
    centerValue:
      participation.percentage == null ? 'Awaiting activity' : `${participation.percentage}%`,
    statusLabel:
      participation.percentage == null
        ? 'Awaiting activity'
        : participation.displayStatus === 'On track'
          ? 'Positive signal'
          : participation.displayStatus,
    summary:
      participation.percentage == null
        ? participation.missingReason || 'Assessment participation has not been recorded yet.'
        : `${participation.numerator} of ${participation.denominator} students have at least one assessment.`,
    details: {
      source: 'assessment_results_v2 participation rollup',
      numerator: participation.numerator,
      denominator: participation.denominator,
      includedStudents: participation.numerator,
      excludedStudents: Math.max(0, participation.denominator - participation.numerator),
      dataSufficiencyRule: 'Student counts with any baseline or post assessment attempt.',
      lastCalculatedAt: new Date().toISOString(),
      baselineCompleted: participation.baselineCompleted,
      postCompleted: participation.postCompleted,
    },
    available: participation.percentage != null,
    percentage: participation.percentage,
  };
}

function buildOverallLiveSignal(domainSignals) {
  const contributors = domainSignals.filter((signal) => signal.available && signal.key !== 'weekly' && signal.key !== 'participation');
  const percents = contributors
    .map((signal) => numberOrNull(String(signal.centerValue).replace('%', '')))
    .filter((value) => value != null);
  const composite = average(percents);
  const available = percents.length > 0;
  return {
    key: 'overall',
    label: 'Overall live learning signal',
    evidenceType: 'directional',
    centerValue: composite == null ? 'Awaiting activity' : `${round(composite)}%`,
    statusLabel: liveStatusLabel(composite, percents.length),
    summary: available
      ? `Unweighted composite from ${percents.length} domain signal(s) with valid activity data. Missing domains are excluded, not treated as zero.`
      : 'Overall live signal will appear after reading, SEL, or focus mission activity is recorded.',
    details: {
      source: 'Unweighted average of available domain live signals',
      numerator: round(percents.reduce((sum, value) => sum + value, 0), 2),
      denominator: percents.length,
      includedStudents: null,
      excludedStudents: null,
      dataSufficiencyRule: 'Includes only reading, SEL, and focus domains with valid module activity.',
      lastCalculatedAt: new Date().toISOString(),
      includedDomainCount: percents.length,
      totalDomainCount: 3,
      weighting: 'Unweighted average; missing domains excluded',
    },
    available,
  };
}

function buildLiveLearningSnapshot(input) {
  const {
    modules = [],
    participantIds,
    weeklyCompletion,
    weekRows = [],
    participation,
    participantCount,
    weeklyProgressSourceAvailable = true,
  } = input;
  const reading = buildDomainLiveSignal('reading', modules, participantIds);
  const sel = buildDomainLiveSignal('sel', modules, participantIds);
  const focus = buildDomainLiveSignal('focus', modules, participantIds);
  const weekly = buildWeeklyLiveSignal(
    weeklyCompletion,
    weekRows,
    participantCount,
    weeklyProgressSourceAvailable,
  );
  const participationSignal = buildParticipationLiveSignal(participation);
  const overall = buildOverallLiveSignal([reading, sel, focus]);
  return {
    calculatedAt: new Date().toISOString(),
    subtitle:
      'Continuously updated from student activity, mission completion, accuracy, and skill-tagged adventures.',
    cards: [reading, sel, focus, weekly, participationSignal, overall],
    evidenceGuide: {
      operational: 'Enrollment, activity, completion, coins, certificates, and participation counts.',
      directional: 'Live learning signals derived from tagged mission activity and accuracy.',
      verified: 'Matched baseline and post-assessment changes (see Verified Growth).',
    },
  };
}

module.exports = {
  LIVE_DOMAINS,
  buildLiveLearningSnapshot,
  buildDomainLiveSignal,
  moduleDomain,
  modulePercent,
  liveStatusLabel,
};
