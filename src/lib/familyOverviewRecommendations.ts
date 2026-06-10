import type { FamilyChildSummary } from './familyChildrenMetrics';
import type { LocalModuleResultRecord } from './pilotTrackingLocalStorage';

export type FamilyRecommendedNext = {
  headline: string;
  body: string;
  href: string;
  cta: string;
};

export type FamilyB4QuickAction = {
  id: string;
  label: string;
  href?: string;
  prompt?: string;
  openGoals?: boolean;
  openChildDrawer?: boolean;
};

function childModules(
  participantId: string | null | undefined,
  moduleResults: LocalModuleResultRecord[],
): LocalModuleResultRecord[] {
  if (!participantId?.trim()) return [];
  return moduleResults
    .filter((row) => row.role === 'student' && row.participant_id === participantId)
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
}

export function buildFamilyRecommendedNext(input: {
  activeChild: FamilyChildSummary | null;
  moduleResults: LocalModuleResultRecord[];
  baselinePath: string;
  continueLearningPath: string;
  downloadsPath: string;
}): FamilyRecommendedNext {
  const child = input.activeChild;
  const childName = child?.displayName ?? 'your child';

  if (!child || child.baselineStatus !== 'Complete') {
    return {
      headline: 'Start with the B-4 Baseline Check',
      body: `Help ${childName} complete a short check-in so we can personalize activities and track progress.`,
      href: input.baselinePath,
      cta: 'Start Activity',
    };
  }

  const completed = childModules(child.participantId, input.moduleResults);
  if (completed.length === 0) {
    return {
      headline: 'Try your first weekly adventure',
      body: `Week 1 activities are a great place to begin building focus and confidence with ${childName}.`,
      href: input.continueLearningPath,
      cta: 'Start Activity',
    };
  }

  const latest = completed[0];
  if (latest?.module_title) {
    return {
      headline: 'Keep the momentum going',
      body: `${childName} recently finished ${latest.module_title}. Try the next recommended activity together.`,
      href: input.continueLearningPath,
      cta: 'Start Activity',
    };
  }

  return {
    headline: 'Wind down with a creative activity',
    body: 'Coloring pages and reflection prompts are a calm way to practice focus together tonight.',
    href: input.downloadsPath,
    cta: 'Start Activity',
  };
}

export function buildFamilyOverviewB4QuickActions(input: {
  overviewPath: string;
  continueLearningPath: string;
  downloadsPath: string;
}): FamilyB4QuickAction[] {
  return [
    {
      id: 'pick-activity',
      label: 'Help me pick an activity',
      prompt: 'Help me pick an activity for my child tonight',
      href: input.continueLearningPath,
    },
    {
      id: 'child-progress',
      label: "Show my child's progress",
      href: input.overviewPath,
      openChildDrawer: true,
    },
    {
      id: 'tonight',
      label: 'What should we try tonight?',
      prompt: 'What should we try tonight with my child?',
      href: input.downloadsPath,
    },
    {
      id: 'explain-scores',
      label: 'Explain these scores',
      prompt: 'What do the baseline and progress scores mean for my child?',
    },
    {
      id: 'update-goals',
      label: 'Help me update family goals',
      openGoals: true,
      prompt: 'Help me choose family goals',
    },
  ];
}
