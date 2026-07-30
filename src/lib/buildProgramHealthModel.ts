import type { PilotOutcomeProgram } from '../types/pilotOutcomes';

export type ProgramHealthTimelineStepKey =
  | 'programCreated'
  | 'studentsAdded'
  | 'baselineComplete'
  | 'adventuresActive'
  | 'weeklyActivities'
  | 'postAssessment'
  | 'finalGrowthReport';

export type ProgramHealthTimelineStep = {
  key: ProgramHealthTimelineStepKey;
  label: string;
  state: 'complete' | 'current' | 'upcoming';
  detail: string;
  marker: string;
};

export type ProgramHealthModel = {
  metrics: Array<{ label: string; value: string }>;
  timeline: ProgramHealthTimelineStep[];
  statusBanner: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function studentsWithAdventure(program: PilotOutcomeProgram): number {
  if (program.studentsWithAdventureCount != null) return program.studentsWithAdventureCount;
  return (program.students ?? []).filter(
    (row) => row.weeklyAdventuresCompleted > 0 || row.missionsCompleted > 0,
  ).length;
}

function studentsWithAssessment(program: PilotOutcomeProgram): number {
  const students = program.students ?? [];
  if (students.length) {
    return students.filter(
      (row) => row.assessmentsCompleted > 0 || row.baselineScore != null || row.postScore != null,
    ).length;
  }
  return program.baseline.count;
}

function formatCoins(value: number): string {
  return value.toLocaleString('en-US');
}

function countPair(count: number, total: number): string {
  if (!total) return String(count);
  return `${count} of ${total}`;
}

function activeStudentsThisWeek(program: PilotOutcomeProgram): number {
  if (program.activeStudentCountThisWeek != null) return program.activeStudentCountThisWeek;
  const students = program.students ?? [];
  if (!students.length) return 0;
  const cutoff = Date.now() - 7 * MS_PER_DAY;
  return students.filter((student) => {
    if (!student.lastActivity) return false;
    const ts = Date.parse(student.lastActivity);
    return Number.isFinite(ts) && ts >= cutoff;
  }).length;
}

function adventuresActive(program: PilotOutcomeProgram): boolean {
  return (
    program.weeklyCompletion.count > 0 ||
    program.missionCount > 0 ||
    (program.students?.some((row) => row.weeklyAdventuresCompleted > 0) ?? false)
  );
}

function baselineComplete(program: PilotOutcomeProgram): boolean {
  return program.baseline.total > 0 && program.baseline.count >= program.baseline.total;
}

function postStarted(program: PilotOutcomeProgram): boolean {
  return program.post.count > 0;
}

function finalReportReady(program: PilotOutcomeProgram): boolean {
  return program.reportStatus === 'Ready' && program.matchedCount > 0 && program.post.count > 0;
}

export function buildProgramHealthModel(program: PilotOutcomeProgram): ProgramHealthModel {
  const participation = program.impactSnapshot.participation;
  const weeklyImpact = program.impactSnapshot.weeklyCompletion;
  const weeklyProgress = program.weeklyCompletion;
  const atLeastOneAdventure = adventuresActive(program);

  const metrics = [
    { label: 'Students enrolled', value: String(program.activeStudentCount) },
    { label: 'Baseline completed', value: String(program.baseline.count) },
    { label: 'At least one adventure', value: String(studentsWithAdventure(program)) },
    { label: 'At least one assessment', value: String(studentsWithAssessment(program)) },
    {
      label: 'Weekly completion',
      value:
        program.weeklyProgressSourceAvailable === false
          ? 'Unavailable'
          : weeklyImpact.percentage == null
            ? 'Not enough data'
            : `${weeklyImpact.percentage}%`,
    },
    {
      label: 'Participation',
      value:
        participation.percentage == null ? 'Not enough data' : `${participation.percentage}%`,
    },
    { label: 'Certificates earned', value: String(program.certificateCount) },
    { label: 'Coins earned', value: formatCoins(program.focusCoins) },
    { label: 'Active students this week', value: String(activeStudentsThisWeek(program)) },
  ];

  const stepDefs: Array<{ key: ProgramHealthTimelineStepKey; label: string; detail: string }> = [
    {
      key: 'programCreated',
      label: 'Program Created',
      detail: program.startDate ? `Started ${program.startDate}` : 'Program record is live',
    },
    {
      key: 'studentsAdded',
      label: 'Students Added',
      detail: `${program.activeStudentCount} enrolled`,
    },
    {
      key: 'baselineComplete',
      label: 'Baseline Complete',
      detail: countPair(program.baseline.count, program.baseline.total),
    },
    {
      key: 'adventuresActive',
      label: 'Adventures Active',
      detail: atLeastOneAdventure ? 'Weekly adventures underway' : 'Awaiting first adventure',
    },
    {
      key: 'weeklyActivities',
      label: 'Weekly Activities',
      detail:
        weeklyProgress.rate == null
          ? program.weeklyProgressSourceAvailable === false
            ? 'Weekly progress source unavailable'
            : 'Weekly progress not recorded yet'
          : `${weeklyProgress.count} of ${weeklyProgress.total} student-weeks`,
    },
    {
      key: 'postAssessment',
      label: 'Post Assessment',
      detail: countPair(program.post.count, program.post.total),
    },
    {
      key: 'finalGrowthReport',
      label: 'Final Growth Report',
      detail: finalReportReady(program)
        ? 'Matched growth report ready'
        : program.post.count === 0
          ? 'Growth pending — post assessments not complete'
          : 'Awaiting matched post data',
    },
  ];

  const completionFlags = [
    true,
    program.activeStudentCount > 0,
    baselineComplete(program),
    atLeastOneAdventure,
    weeklyProgress.count > 0,
    postStarted(program),
    finalReportReady(program),
  ];

  const firstIncomplete = completionFlags.findIndex((done) => !done);
  const timeline: ProgramHealthTimelineStep[] = stepDefs.map((step, index) => {
    let state: ProgramHealthTimelineStep['state'] = 'upcoming';
    if (completionFlags[index]) state = 'complete';
    else if (firstIncomplete === index) state = 'current';
    const marker = state === 'complete' ? '✓' : state === 'current' ? '◐' : '○';
    return { ...step, state, marker };
  });

  let statusBanner: string;
  if (finalReportReady(program)) {
    statusBanner = 'Final growth reporting is ready for facilitator review.';
  } else if (program.post.count === 0 && program.baseline.count > 0) {
    statusBanner =
      'Baseline is underway. Post-assessment growth is pending until matched post scores are recorded.';
  } else if (!program.activeStudentCount) {
    statusBanner = 'Program is created. Add students to begin baseline and weekly activities.';
  } else if (!baselineComplete(program)) {
    statusBanner = 'Students are enrolled. Complete baseline assessments to unlock growth tracking.';
  } else {
    statusBanner = 'Program is active. Continue weekly activities and schedule post assessments.';
  }

  return { metrics, timeline, statusBanner };
}

export function isGrowthPending(program: PilotOutcomeProgram): boolean {
  return program.baseline.count > 0 && program.post.count === 0;
}
