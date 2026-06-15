import { B4_AVATAR_SRC } from '../data/b4/avatar';
import type {
  B4InsightsPayload,
  FamilyB4InsightTopic,
} from '../types/b4Insights';
import type { FamilyChildSummary } from './familyChildrenMetrics';
import type { FamilyNeedsAttentionItem } from './familyOverviewInsights';
import type { FamilyProgressSnapshot } from './familyProgressMetrics';
import type { ProgressCounts } from './familyProgressHelpers';
import { loadLocalQuestionAttemptsForParticipant } from './questionAttemptLocalStorage';
import {
  buildParentAttemptInsightLabels,
  computeQuestionAttemptMetrics,
  type QuestionAttemptMetricRow,
} from './questionAttemptMetrics';

type FamilyOnboardingFlags = {
  hasChild: boolean;
  hasChildGrade: boolean;
  hasFamilyGoals: boolean;
  hasCompletedB4CheckIn: boolean;
  hasChosenPath: boolean;
};

type FamilyInsightPaths = {
  baseline: string;
  continueLearning: string;
  familyGoals: string;
  childrenSettings: string;
  settingsOverview: string;
};

export type BuildFamilyB4InsightsInput = {
  topic: FamilyB4InsightTopic;
  child: FamilyChildSummary | null;
  programName?: string;
  metrics: FamilyProgressSnapshot;
  overallProgress: ProgressCounts;
  goalsStatus: string;
  onboarding: FamilyOnboardingFlags;
  needsAttention?: FamilyNeedsAttentionItem[];
  baselineAveragePct?: number | null;
  assessmentProgress?: ProgressCounts;
  gallerySubmissionCount?: number;
  certificateCount?: number;
  baselineScorePct?: number | null;
  paths: FamilyInsightPaths;
};

function childName(child: FamilyChildSummary | null): string {
  return child?.displayName ?? 'your child';
}

function childAttemptMetrics(participantId: string | null | undefined): QuestionAttemptMetricRow[] {
  if (!participantId?.trim()) return [];
  return loadLocalQuestionAttemptsForParticipant(participantId).map((row) => ({
    participant_id: row.participant_id,
    program_code: row.program_code,
    week_number: row.week_number ?? null,
    mission_id: row.mission_id,
    character: row.character ?? null,
    question_id: row.question_id,
    grade_level: row.grade_level ?? null,
    grade_band: row.grade_band ?? null,
    content_version: row.content_version ?? null,
    is_correct_first_try: row.is_correct_first_try,
    is_correct_final: row.is_correct_final,
    used_hint: row.used_hint,
    attempt_count: row.attempt_count,
    attempt_type: row.attempt_type ?? 'initial',
    is_replay: row.is_replay ?? false,
    completed_at: row.completed_at,
  }));
}

function attemptInsightMetrics(child: FamilyChildSummary | null): B4InsightsPayload['metrics'] {
  const rows = childAttemptMetrics(child?.participantId);
  if (rows.length === 0) return [];
  const metrics = computeQuestionAttemptMetrics(rows, { attemptScope: 'initial' });
  const labels = buildParentAttemptInsightLabels(metrics);
  return [
    { label: 'First-try accuracy', value: `${Math.round(metrics.first_attempt_accuracy * 100)}%`, hint: labels.firstTryLabel },
    { label: 'Final mission accuracy', value: `${Math.round(metrics.final_accuracy * 100)}%`, hint: labels.completionLabel },
    { label: 'Improved after support', value: String(metrics.improved_after_support), hint: labels.improvedLabel },
    { label: 'Needs more practice', value: String(metrics.needs_more_practice), hint: labels.practiceLabel },
    { label: 'Growth over time', value: 'Tracking', hint: labels.growthLabel },
  ];
}

function supportingMetrics(input: BuildFamilyB4InsightsInput): B4InsightsPayload['metrics'] {
  const child = input.child;
  return [
    {
      label: 'Overall progress',
      value: input.metrics.hasActivity ? `${input.overallProgress.percent}%` : '0%',
      hint: input.overallProgress.label,
    },
    {
      label: 'Baseline status',
      value: child?.baselineStatus ?? '—',
      hint: child?.displayName,
    },
    {
      label: 'B-4 Check-In',
      value: child?.b4CheckInStatus ?? '—',
      hint: child?.displayName,
    },
    {
      label: 'Modules completed',
      value: child ? `${child.completedCount} of ${child.totalCount}` : '—',
      hint: 'Weekly adventures & missions',
    },
    {
      label: 'Family goals',
      value: input.goalsStatus,
      hint: input.onboarding.hasFamilyGoals ? 'Configured' : 'Not set yet',
    },
    {
      label: 'Last activity',
      value: child?.latestActivity ?? '—',
    },
    {
      label: 'Certificates earned',
      value: String(input.certificateCount ?? 0),
    },
    ...attemptInsightMetrics(child),
  ].filter((metric) => metric.value !== '—' || metric.label === 'Baseline status');
}

function onboardingInsights(flags: FamilyOnboardingFlags): B4InsightsPayload['insights'] {
  const items: B4InsightsPayload['insights'] = [];
  if (!flags.hasChild) {
    items.push({
      id: 'setup-child',
      label: 'Child profile missing',
      detail: 'Add your child so B-4 can personalize activities and track progress.',
      tone: 'setup',
    });
  }
  if (flags.hasChild && !flags.hasChildGrade) {
    items.push({
      id: 'setup-grade',
      label: 'Grade level not configured',
      detail: 'Select a grade in Settings → Children so activities match your child.',
      tone: 'setup',
    });
  }
  if (!flags.hasFamilyGoals) {
    items.push({
      id: 'setup-goals',
      label: 'Family goals not set',
      detail: 'Goals help B-4 recommend better weekly adventures.',
      tone: 'setup',
    });
  }
  if (!flags.hasCompletedB4CheckIn) {
    items.push({
      id: 'setup-baseline',
      label: 'B-4 Check-In not finished',
      detail: 'The check-in establishes a starting point for focus, reading, and confidence.',
      tone: 'attention',
    });
  }
  if (flags.hasCompletedB4CheckIn && !flags.hasChosenPath) {
    items.push({
      id: 'setup-path',
      label: 'Learning path not chosen',
      detail: 'Pick guided weekly missions or character adventures to continue.',
      tone: 'setup',
    });
  }
  return items;
}

export function buildFamilyB4Insights(input: BuildFamilyB4InsightsInput): B4InsightsPayload {
  const name = childName(input.child);
  const base: Omit<B4InsightsPayload, 'title' | 'summary' | 'insights' | 'recommendations' | 'nextActions'> = {
    portalType: 'family',
    eyebrow: 'B-4 Insights',
    childName: input.child?.displayName,
    programName: input.programName,
    avatarImage: B4_AVATAR_SRC,
    metrics: supportingMetrics(input),
  };

  const setupInsights = onboardingInsights(input.onboarding);

  if (input.topic === 'overall' || input.topic === 'child-progress') {
    const completed = input.child?.completedCount ?? 0;
    const total = input.child?.totalCount ?? 0;
    const recommendations = [
      'Continue weekly adventures to grow overall progress.',
      ...(input.onboarding.hasFamilyGoals ? [] : ['Set family goals so B-4 can personalize recommendations.']),
      ...(input.onboarding.hasCompletedB4CheckIn ? [] : ['Complete the B-4 Check-In to unlock better guidance.']),
    ];

    return {
      ...base,
      title: `${name}'s Progress Snapshot`,
      summary: `${name} has completed ${completed} of ${total} module activities${
        input.onboarding.hasCompletedB4CheckIn ? ' and finished the B-4 Check-In' : ''
      }. Progress grows as your family completes weekly adventures, games, and check-ins.`,
      insights: [
        {
          id: 'progress',
          label: 'Recent progress',
          detail: input.child?.progressLabel ?? 'Activity will appear after your first missions.',
          tone: 'progress',
        },
        ...setupInsights,
        ...(input.metrics.hasChildActivity
          ? [
              {
                id: 'strength',
                label: 'Momentum building',
                detail: 'Your family has started building a learning rhythm.',
                tone: 'strength' as const,
              },
            ]
          : []),
      ],
      recommendations,
      nextActions: [
        {
          id: 'continue',
          label: 'Continue Weekly Adventures',
          href: input.paths.continueLearning,
          variant: 'primary',
        },
        ...(input.onboarding.hasFamilyGoals
          ? []
          : [
              {
                id: 'goals',
                label: 'Set Family Goals',
                href: input.paths.familyGoals,
                variant: 'secondary' as const,
              },
            ]),
        {
          id: 'settings',
          label: 'Open Settings',
          href: input.paths.childrenSettings,
          variant: 'secondary',
        },
      ],
    };
  }

  if (input.topic === 'baseline') {
    return {
      ...base,
      title: 'B-4 Check-In Insight',
      summary: `${name}'s check-in helps B-4 understand their starting point for focus, reading, and confidence.${
        input.child?.b4CheckInStatus === 'Complete'
          ? ' The B-4 Check-In is complete — use these results to choose the next best activity.'
          : ' Completing the check-in unlocks clearer recommendations on your dashboard.'
      }`,
      insights: [
        {
          id: 'baseline-status',
          label: 'Baseline status',
          detail: input.child?.baselineStatus ?? 'Not started',
          tone: input.child?.baselineStatus === 'Complete' ? 'strength' : 'attention',
        },
        {
          id: 'b4-check-in-status',
          label: 'B-4 Check-In',
          detail: input.child?.b4CheckInStatus ?? 'Not started',
          tone: input.child?.b4CheckInStatus === 'Complete' ? 'strength' : 'attention',
        },
        ...setupInsights.filter((item) => item.id.includes('baseline') || item.id.includes('goals')),
      ],
      recommendations: [
        'Complete the B-4 Check-In if it is still open.',
        'Review baseline details after completion.',
        'Continue with a recommended weekly adventure.',
      ],
      nextActions: [
        {
          id: 'baseline',
          label:
            input.child?.b4CheckInStatus === 'Complete' ? 'Review Check-In Hub' : 'Complete B-4 Check-In',
          href: input.paths.baseline,
          variant: 'primary',
        },
        {
          id: 'continue',
          label: 'Continue Recommended Activity',
          href: input.paths.continueLearning,
          variant: 'secondary',
        },
      ],
    };
  }

  if (input.topic === 'modules') {
    return {
      ...base,
      title: 'Weekly Adventure Insight',
      summary: `${name} has completed ${input.child?.completedCount ?? 0} of ${
        input.child?.totalCount ?? 0
      } module activities. Weekly adventures and character missions are the best way to build focus skills over time.`,
      insights: [
        {
          id: 'modules',
          label: 'Modules completed',
          detail: input.child?.progressLabel ?? 'No module progress yet.',
          tone: 'progress',
        },
        ...(input.metrics.hasChildActivity
          ? []
          : [
              {
                id: 'attention',
                label: 'Needs a first mission',
                detail: 'Try a short weekly adventure together to start momentum.',
                tone: 'attention' as const,
              },
            ]),
      ],
      recommendations: [
        'Continue the next weekly adventure.',
        'Use family goals to steer recommendations.',
        'Celebrate small wins after each completed mission.',
      ],
      nextActions: [
        {
          id: 'continue',
          label: 'Continue Weekly Adventures',
          href: input.paths.continueLearning,
          variant: 'primary',
        },
        {
          id: 'child',
          label: 'View Child Details',
          href: input.paths.childrenSettings,
          variant: 'secondary',
        },
      ],
    };
  }

  if (input.topic === 'family-goals') {
    return {
      ...base,
      title: 'Family Goals Insight',
      summary: input.onboarding.hasFamilyGoals
        ? `Family goals are set for ${name}. B-4 uses these focus areas and strengths to recommend better activities. You can update goals anytime in Settings.`
        : `Family goals help B-4 recommend better activities for ${name}. Choose focus areas and strengths that match your family's priorities.`,
      insights: [
        {
          id: 'goals-status',
          label: 'Family goals status',
          detail: input.goalsStatus,
          tone: input.onboarding.hasFamilyGoals ? 'strength' : 'setup',
        },
        ...setupInsights.filter((item) => item.id.includes('goals') || item.id.includes('grade')),
      ],
      recommendations: [
        input.onboarding.hasFamilyGoals ? 'Review goals as your child grows.' : 'Set family goals to personalize recommendations.',
        ...(input.onboarding.hasChildGrade ? [] : ['Configure grade level in Settings → Children.']),
        'Update goals in Settings when priorities change.',
      ],
      nextActions: [
        {
          id: 'goals',
          label: input.onboarding.hasFamilyGoals ? 'Update Goals in Settings' : 'Set Family Goals',
          href: input.paths.familyGoals,
          variant: 'primary',
        },
        {
          id: 'children',
          label: 'Open Settings → Children',
          href: input.paths.childrenSettings,
          variant: 'secondary',
        },
      ],
    };
  }

  const attentionItem = input.needsAttention?.[0];
  return {
    ...base,
    title: 'Focus Flame Journey Insight',
    summary: attentionItem
      ? `${attentionItem.label}. ${attentionItem.detail}`
      : `B-4 reviewed your dashboard and highlighted the next best moves for ${name}.`,
    insights: (input.needsAttention ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      detail: item.detail,
      tone: item.highlight ? 'attention' : 'progress',
    })),
    recommendations: [
      'Address the highest-priority reminder first.',
      'Use Mission Coach on the right for step-by-step setup.',
      'Open Settings only when you need to edit family configuration.',
    ],
    nextActions: [
      {
        id: 'overview',
        label: 'Continue Setup',
        href: input.paths.settingsOverview,
        variant: 'primary',
      },
      ...(attentionItem?.href
        ? [{ id: 'attention', label: 'Take Recommended Action', href: attentionItem.href, variant: 'secondary' as const }]
        : []),
    ],
  };
}
