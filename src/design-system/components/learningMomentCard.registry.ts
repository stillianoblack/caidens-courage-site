import type { LearningMomentVariant } from '../game/LearningMomentCard';

export const LEARNING_MOMENT_SPACING_TOKENS = {
  maxWidth: '900px',
  avatarGap: '16px',
  badgeToHeadline: '8px',
  headlineToBody: '16px',
  bodyToSections: '20px',
  sectionGap: '16px',
  avatarSizeDesktop: '72px',
  avatarSizeMobile: '56px',
} as const;

export const LEARNING_MOMENT_TYPOGRAPHY = {
  badge: '0.625rem / 800 / uppercase / 0.06em letter-spacing',
  headline: '0.9375rem / 800',
  body: '0.8125rem / 1.55 line-height',
  sectionTitle: '0.6875rem / 800 / uppercase',
  sectionBody: '0.75rem / 1.55 line-height',
} as const;

export type LearningMomentVariantMeta = {
  id: LearningMomentVariant;
  label: string;
  avatarType: 'b4' | 'dr-victoria';
  defaultTitle: string;
  background: string;
  accent: string;
  portals: Array<'kid' | 'family' | 'facilitator'>;
  usage: string[];
  sections: string[];
};

export const LEARNING_MOMENT_VARIANTS: Record<LearningMomentVariant, LearningMomentVariantMeta> = {
  B4_LOCK_IN: {
    id: 'B4_LOCK_IN',
    label: 'B-4 Lock-In',
    avatarType: 'b4',
    defaultTitle: 'B-4 Coach',
    background: 'Focus Navy gradient',
    accent: 'Focus Gold',
    portals: ['kid', 'family', 'facilitator'],
    usage: [
      'Games — choice feedback after answer check',
      'Activities — quick coaching beats',
      'Learning paths — step reinforcement',
      'Mission completion — celebrate + next move',
    ],
    sections: ['Headline', 'Body', 'Tips (numbered)', 'Optional CTA'],
  },
  B4_PARENT_COACH: {
    id: 'B4_PARENT_COACH',
    label: 'B-4 Parent Coach',
    avatarType: 'b4',
    defaultTitle: 'B-4 Parent Coach',
    background: 'Light neutral',
    accent: 'Blue',
    portals: ['family'],
    usage: [
      'Family portal coaching moments',
      'Parent reflection after kid activities',
      'Home practice prompts',
    ],
    sections: ['Why It Matters', 'Try This At Home', 'Watch For'],
  },
  FACILITATOR_INSIGHT: {
    id: 'FACILITATOR_INSIGHT',
    label: 'Facilitator Insight',
    avatarType: 'dr-victoria',
    defaultTitle: 'Dr. Victoria Says',
    background: 'Soft lavender',
    accent: 'Purple',
    portals: ['facilitator'],
    usage: [
      'Facilitator portal reflection games',
      'Educator training modules',
      'Professional development scenarios',
    ],
    sections: ['Why It Matters', 'Try This', 'Watch For'],
  },
};

export const LEARNING_MOMENT_CARD_REGISTRY = {
  name: 'LearningMomentCard',
  description:
    'Official Focus Flame coaching card pattern. Replaces custom tip boxes and redundant bottom feedback panels.',
  props: [
    { name: 'variant', type: 'B4_LOCK_IN | B4_PARENT_COACH | FACILITATOR_INSIGHT', required: true },
    { name: 'title', type: 'string', required: false, note: 'Badge label; variant default when omitted' },
    { name: 'headline', type: 'string', required: true, note: 'Primary coaching message' },
    { name: 'body', type: 'string', required: false, note: 'Supporting copy below headline' },
    { name: 'tips', type: 'string[]', required: false, note: 'Bullet tips (B4_LOCK_IN)' },
    { name: 'whyItMatters', type: 'string', required: false },
    { name: 'tryThis', type: 'string[]', required: false },
    { name: 'tryThisLabel', type: 'string', required: false },
    { name: 'watchFor', type: 'string', required: false },
    { name: 'avatarType', type: 'b4 | dr-victoria', required: false },
    { name: 'avatarSrc', type: 'string', required: false },
    { name: 'actionLabel', type: 'string', required: false },
    { name: 'onAction', type: '() => void', required: false },
  ],
  aiFields: [
    'title',
    'headline',
    'body',
    'why_it_matters',
    'try_this',
    'watch_for',
    'avatar_type',
    'variant',
  ],
  spacingTokens: LEARNING_MOMENT_SPACING_TOKENS,
  typography: LEARNING_MOMENT_TYPOGRAPHY,
  variants: LEARNING_MOMENT_VARIANTS,
  usageGuidelines: [
    'Show after the user answers — never before selection.',
    'Hide legacy MissionFeedbackCard when LearningMomentCard is visible.',
    'Facilitator games: B4_LOCK_IN after each answer; FACILITATOR_INSIGHT every 2–3 questions.',
    'Family portal: use B4_PARENT_COACH — not Parent Mentor Says.',
    'One coaching card per screen region — avoid stacking duplicate messages.',
    'B-4 Lock-In content comes from getB4LockInTip() — answer-aware, skill-aware, portal-toned.',
  ],
} as const;
