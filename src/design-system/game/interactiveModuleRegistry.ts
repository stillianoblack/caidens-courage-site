/**
 * Focus Flame — Interactive Module System
 *
 * All question-based experiences (kid games, facilitator training, family activities,
 * baseline checks, adult assessments) share one shell pattern. Training modules are
 * NOT a separate UI system — they are interactive modules with different content
 * and feedback variants.
 *
 * Production runtime: GameAssessmentFlow + SharedMissionGameLayout implement the
 * coaching-shell layout (bbc-app--coachingShell). GameShell is the design-system
 * primitive and target API for new work.
 */

export const INTERACTIVE_MODULE_COMPONENTS = {
  /** Standard wrapper for question-based experiences (alias: InteractiveModuleShell) */
  GameShell: 'GameShell',
  /** @deprecated Use GameShell — same component */
  InteractiveModuleShell: 'GameShell',
  /** Mission card / scenario prompt above the question */
  QuestionCard: 'QuestionCard',
  /** Multiple-choice answer list */
  AnswerChoiceList: 'AnswerChoiceList',
  /** Sticky Skip / Check / Continue footer */
  ModuleFooter: 'ModuleFooter',
  /** Official coaching card — B4_LOCK_IN, B4_PARENT_COACH, FACILITATOR_INSIGHT */
  LearningMomentCard: 'LearningMomentCard',
  /** @deprecated Wrapper — use LearningMomentCard variant="B4_LOCK_IN" */
  B4LockInTip: 'B4LockInTip',
  /** Adult facilitator reflection rail */
  ExpertInsightCard: 'ExpertInsightCard',
} as const;

export type InteractiveModuleKind =
  | 'kid_game'
  | 'facilitator_training'
  | 'family_activity'
  | 'baseline_check'
  | 'adult_assessment'
  | 'parent_corner';

export type InteractiveModuleExample = {
  kind: InteractiveModuleKind;
  label: string;
  shell: string;
  feedbackVariant: 'B4_LOCK_IN' | 'FACILITATOR_INSIGHT' | 'B4_PARENT_COACH' | 'legacy';
  routeExample: string;
  runtimeFlow: string;
};

/** Documented examples — all use GameShell pattern (directly or via GameAssessmentFlow). */
export const INTERACTIVE_MODULE_EXAMPLES: InteractiveModuleExample[] = [
  {
    kind: 'kid_game',
    label: "Caiden's Focus Quest",
    shell: 'GameShell / GameAssessmentFlow',
    feedbackVariant: 'B4_LOCK_IN',
    routeExample: '/program-dashboard/kids/caiden/quest-1',
    runtimeFlow: 'GameAssessmentFlow',
  },
  {
    kind: 'facilitator_training',
    label: 'Adult Training (Dr. Victoria / Uncle T)',
    shell: 'GameShell / GameAssessmentFlow',
    feedbackVariant: 'FACILITATOR_INSIGHT',
    routeExample: '/portal/facilitator/adult-training/victoria/mission-1',
    runtimeFlow: 'GameAssessmentFlow',
  },
  {
    kind: 'family_activity',
    label: 'Family reflection / parent corner mission',
    shell: 'GameShell / GameAssessmentFlow',
    feedbackVariant: 'B4_PARENT_COACH',
    routeExample: '/family-hub/guide/victoria/mission-1',
    runtimeFlow: 'GameAssessmentFlow',
  },
  {
    kind: 'baseline_check',
    label: 'B-4 Baseline Check',
    shell: 'GameShell (quiz phase target)',
    feedbackVariant: 'B4_LOCK_IN',
    routeExample: '/family-hub/baseline-check',
    runtimeFlow: 'B4BaselineCheckFlow',
  },
  {
    kind: 'adult_assessment',
    label: 'Adult Growth Assessment',
    shell: 'GameShell (quiz phase target)',
    feedbackVariant: 'FACILITATOR_INSIGHT',
    routeExample: '/family-hub/adult-assessment/pre',
    runtimeFlow: 'AdultGrowthCheckFlow',
  },
];

export const INTERACTIVE_MODULE_RULES = [
  'If it has questions, answers, progress, skip/check, and continue — use GameShell.',
  'Do not split training and games into separate shell patterns.',
  'Use LearningMomentCard for post-answer coaching; ModuleFooter for actions.',
  'Kid/family games: B4_LOCK_IN via getB4LockInTip(). Adult training: FACILITATOR_INSIGHT.',
  'Preserve module_results and assessment_results_v2 saving — shell changes must not break scoring.',
] as const;
