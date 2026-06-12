import { B4_AVATAR_SRC } from '../data/b4/avatar';
import type { B4InsightsPayload, FacilitatorB4InsightTopic } from '../types/b4Insights';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import type { PilotTrackingMetrics } from './pilotTrackingMetrics';
import { formatAdminPct } from './b4BaselineAdminStats';
import { formatAssessmentScore, formatModuleScore, resolveParticipantDisplayName } from './pilotResultsDisplay';
import type { ParticipantNameLookup } from './pilotResultsDisplay';
import { formatAssessmentTypeLabel, resolveBaselineStatus } from './pilotStudentProgress';

export type BuildFacilitatorB4InsightsInput = {
  topic: FacilitatorB4InsightTopic;
  metrics: PilotTrackingMetrics;
  programName?: string;
  missingBaselineCount?: number;
  paths?: {
    results?: string;
    participants?: string;
  };
};

export type BuildFacilitatorStudentB4InsightsInput = {
  participantId: string;
  participantLookup: ParticipantNameLookup;
  assessments: LocalAssessmentV2Record[];
  modules: LocalModuleResultRecord[];
  programName?: string;
  paths?: BuildFacilitatorB4InsightsInput['paths'];
};

export function buildFacilitatorStudentB4Insights(
  input: BuildFacilitatorStudentB4InsightsInput,
): B4InsightsPayload {
  const childName = resolveParticipantDisplayName(input.participantId, input.participantLookup);
  const assessments = input.assessments
    .filter((row) => row.participant_id?.trim() === input.participantId)
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  const modules = input.modules
    .filter((row) => row.participant_id?.trim() === input.participantId)
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  const baselineStatus = resolveBaselineStatus(input.participantId, input.assessments);
  const latestAssessment = assessments[0];
  const latestModule = modules[0];

  return {
    portalType: 'facilitator',
    eyebrow: 'B-4 Insights',
    title: `${childName}'s Progress`,
    childName,
    programName: input.programName,
    avatarImage: B4_AVATAR_SRC,
    summary: `${childName} has ${modules.length} module completion${modules.length === 1 ? '' : 's'} and a baseline status of ${baselineStatus.toLowerCase()}. Use this snapshot to decide the next facilitator touchpoint.`,
    insights: [
      {
        id: 'baseline',
        label: 'B-4 Check-In',
        detail: baselineStatus,
        tone: baselineStatus === 'Complete' ? 'strength' : 'attention',
      },
      {
        id: 'modules',
        label: 'Module activity',
        detail: `${modules.length} completed module${modules.length === 1 ? '' : 's'}.`,
        tone: modules.length > 0 ? 'progress' : 'setup',
      },
      ...(latestAssessment
        ? [
            {
              id: 'latest-assessment',
              label: 'Latest assessment',
              detail: `${formatAssessmentTypeLabel(latestAssessment.assessment_type)} · ${formatAssessmentScore(latestAssessment)}`,
              tone: 'progress' as const,
            },
          ]
        : []),
      ...(latestModule
        ? [
            {
              id: 'latest-module',
              label: 'Latest module',
              detail: `${latestModule.module_title || latestModule.module_id} · ${formatModuleScore(latestModule)}`,
              tone: 'progress' as const,
            },
          ]
        : []),
    ],
    recommendations: [
      baselineStatus === 'Complete'
        ? 'Review module scores and celebrate recent wins.'
        : 'Prompt this student to complete the B-4 Check-In next.',
      'Open Results for a full exportable history.',
      'Check family link status if parent follow-up is needed.',
    ],
    nextActions: [
      {
        id: 'results',
        label: 'Open Results',
        href: input.paths?.results,
        variant: 'primary',
      },
      {
        id: 'roster',
        label: 'View Roster',
        href: input.paths?.participants,
        variant: 'secondary',
      },
    ],
    metrics: [
      { label: 'Modules completed', value: String(modules.length) },
      { label: 'Assessments', value: String(assessments.length) },
      {
        label: 'Latest module score',
        value: latestModule ? formatModuleScore(latestModule) : '—',
      },
      {
        label: 'Baseline status',
        value: baselineStatus,
      },
    ],
    footerNote: 'B-4 insights are based on completed activities and check-ins.',
  };
}

export function buildFacilitatorB4Insights(input: BuildFacilitatorB4InsightsInput): B4InsightsPayload {
  const { metrics, programName } = input;
  const base = {
    portalType: 'facilitator' as const,
    eyebrow: 'B-4 Insights',
    programName,
    avatarImage: B4_AVATAR_SRC,
    footerNote: 'B-4 insights are based on completed activities and check-ins.',
  };

  if (input.topic === 'participation') {
    return {
      ...base,
      title: 'Program Participation Insight',
      summary: `Your program has ${metrics.studentsEnrolled} participants and ${metrics.baselineChecksCompleted} completed baseline check-ins. Strong participation makes it easier to spot who needs support before the next session.`,
      insights: [
        {
          id: 'participants',
          label: 'Participants enrolled',
          detail: `${metrics.studentsEnrolled} students linked to this program.`,
          tone: 'progress',
        },
        {
          id: 'baseline-gap',
          label: 'Baseline gap',
          detail:
            input.missingBaselineCount && input.missingBaselineCount > 0
              ? `${input.missingBaselineCount} students still need a baseline check-in.`
              : 'Baseline coverage looks healthy.',
          tone: input.missingBaselineCount ? 'attention' : 'strength',
        },
      ],
      recommendations: [
        'Review students missing baseline check-ins.',
        'Open Results to compare participation across modules.',
        'Export a report before your next session.',
      ],
      nextActions: [
        {
          id: 'results',
          label: 'Open Results',
          href: input.paths?.results,
          variant: 'primary',
        },
        {
          id: 'participants',
          label: 'Review Participants',
          href: input.paths?.participants,
          variant: 'secondary',
        },
      ],
      metrics: [
        { label: 'Participation', value: String(metrics.studentsEnrolled) },
        { label: 'Baseline completion', value: String(metrics.baselineChecksCompleted) },
        { label: 'Program health', value: `${metrics.completionRate}%` },
        { label: 'Module completions', value: String(metrics.moduleCompletions) },
      ],
    };
  }

  if (input.topic === 'baseline') {
    return {
      ...base,
      title: 'Baseline Completion Insight',
      summary: `${metrics.baselineChecksCompleted} baseline check-ins are complete. Baseline averages help you understand starting points for focus, reading, and confidence across the program.`,
      insights: [
        {
          id: 'baseline-average',
          label: 'Overall baseline average',
          detail: `${formatAdminPct(metrics.growth.overall)} across completed check-ins.`,
          tone: 'progress',
        },
        {
          id: 'baseline-coverage',
          label: 'Coverage',
          detail: `${metrics.baselineChecksCompleted} of ${metrics.studentsEnrolled} participants.`,
          tone: metrics.baselineChecksCompleted < metrics.studentsEnrolled ? 'attention' : 'strength',
        },
      ],
      recommendations: [
        'Follow up with students who have not started baseline.',
        'Review baseline trends before assigning new modules.',
        'Share results with families when appropriate.',
      ],
      nextActions: [
        {
          id: 'results',
          label: 'Review Baseline Results',
          href: input.paths?.results,
          variant: 'primary',
        },
      ],
      metrics: [
        { label: 'Baseline completion', value: String(metrics.baselineChecksCompleted) },
        { label: 'Focus average', value: formatAdminPct(metrics.growth.focus) },
        { label: 'Reading average', value: formatAdminPct(metrics.growth.reading) },
        { label: 'Confidence average', value: formatAdminPct(metrics.growth.confidence) },
      ],
    };
  }

  if (input.topic === 'modules') {
    return {
      ...base,
      title: 'Module Completion Insight',
      summary: `Students have completed ${metrics.moduleCompletions} module activities across ${metrics.uniqueModulesCompleted} unique modules. Review low-completion areas before the next session.`,
      insights: [
        {
          id: 'module-volume',
          label: 'Completion volume',
          detail: `${metrics.moduleCompletions} total module completions recorded.`,
          tone: 'progress',
        },
        {
          id: 'module-score',
          label: 'Average module score',
          detail: `${formatAdminPct(metrics.averageModuleScorePct)} across completed modules.`,
          tone: 'strength',
        },
      ],
      recommendations: [
        'Identify modules with low participation.',
        'Pair module review with baseline gaps.',
        'Celebrate certificates before the next cohort milestone.',
      ],
      nextActions: [
        {
          id: 'results',
          label: 'Open Results',
          href: input.paths?.results,
          variant: 'primary',
        },
      ],
      metrics: [
        { label: 'Module completions', value: String(metrics.moduleCompletions) },
        { label: 'Unique modules', value: String(metrics.uniqueModulesCompleted) },
        { label: 'Avg module score', value: formatAdminPct(metrics.averageModuleScorePct) },
        { label: 'Participation', value: String(metrics.studentsEnrolled) },
      ],
    };
  }

  return {
    ...base,
    title: 'Program Health Insight',
    summary: `Program health is at ${metrics.completionRate}% participation. Use this snapshot to decide where to focus facilitator time this week.`,
    insights: [
      {
        id: 'health',
        label: 'Participation rate',
        detail: `${metrics.completionRate}% of enrolled students are actively progressing.`,
        tone: metrics.completionRate >= 70 ? 'strength' : 'attention',
      },
    ],
    recommendations: [
      'Review inactive students first.',
      'Check baseline and module completion together.',
      'Use Results for exportable summaries.',
    ],
    nextActions: [
      {
        id: 'results',
        label: 'Open Results',
        href: input.paths?.results,
        variant: 'primary',
      },
    ],
    metrics: [
      { label: 'Program health', value: `${metrics.completionRate}%` },
      { label: 'Participation', value: String(metrics.studentsEnrolled) },
      { label: 'Baseline completion', value: String(metrics.baselineChecksCompleted) },
      { label: 'Module completions', value: String(metrics.moduleCompletions) },
    ],
  };
}
