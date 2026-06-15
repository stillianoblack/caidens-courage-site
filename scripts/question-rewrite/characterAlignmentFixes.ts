import type { StagingQuestionOverride } from './types';

export type CharacterAlignmentFix = {
  questionId: string;
  character: 'caiden' | 'zeke' | 'b4';
  rationale: string;
  before: {
    questionText: string;
    scenarioText?: string;
    choices?: string[];
  };
  after: {
    questionText: string;
    scenarioText?: string;
    choices?: [string, string, string, string];
  };
};

const CAIDEN_BEFORE_STEM = 'Can he afford both items with 10 tokens?';
const CAIDEN_AFTER_STEM =
  'Which purchase plan best fits his 10-token budget for both items?';
const CAIDEN_RATIONALE =
  'Reframes the generic affordability check into a Caiden planning stem with budget and compare cues, without changing choices or correct position.';

const CAIDEN_45_IDS = [
  'cq1-45-q1',
  'cq2-45-q3',
  'cq3-45-q3',
  'cq4-45-q2',
  'cq5-45-q1',
  'cq6-45-q3',
  'cq6-45-q6',
  'cq7-45-q2',
  'cq7-45-q5',
  'cq7-45-q8',
  'cq8-45-q2',
  'cq8-45-q5',
  'cq8-45-q8',
  'cq9-45-q1',
  'cq9-45-q4',
  'cq9-45-q7',
] as const;

const B4_BEFORE_STEM = 'What should B-4 try first before choosing a bigger response?';

const B4_STEM_FIXES: Record<string, { questionText: string; rationale: string }> = {
  'b4m1-45-q3': {
    questionText: 'Which feeling might B-4 name when pride and embarrassment show up together?',
    rationale: 'Names the regulation step (identify feeling) before strategy comparison.',
  },
  'b4m2-45-q2': {
    questionText: 'Which coping strategy fits best after naming the restless body signals?',
    rationale: 'Anchors body-signal awareness and coping strategy selection.',
  },
  'b4m3-45-q1': {
    questionText: 'Which regulation choice best compares the brave step with the easy choice?',
    rationale: 'Uses regulation comparison framing for the brave-choice mission.',
  },
  'b4m4-45-q3': {
    questionText: 'Which coping strategy fits best for resetting focus at the homework station?',
    rationale: 'Ties stem to coping/regulation at the focus reset station.',
  },
  'b4m5-45-q3': {
    questionText: 'Which calm-down strategy fits best before making the next move?',
    rationale: 'Emphasizes calm-down regulation before action.',
  },
  'b4m6-45-q2': {
    questionText: 'Which regulation choice best compares repair steps after someone makes a mistake?',
    rationale: 'Compares regulation choices in the oops repair context.',
  },
  'b4m7-45-q1': {
    questionText: 'Which coping strategy fits best when confidence needs charging?',
    rationale: 'Links self-awareness and coping when confidence is low.',
  },
  'b4m8-45-q3': {
    questionText: 'Which regulation choice best compares the combined skills in the focus flame?',
    rationale: 'Compares integrated regulation skills from the mission arc.',
  },
  'b4m1-68-q1': {
    questionText: 'Which feeling detail best compares what triggered the reaction and how intense it became?',
    rationale: 'Self-awareness stem for trigger and intensity identification.',
  },
  'b4m2-68-q3': {
    questionText: 'Which regulation strategy fits best when body signals buzz before acting?',
    rationale: 'Regulation strategy after reading body signals.',
  },
  'b4m3-68-q2': {
    questionText: 'Which coping choice best compares declining the easy path with doing their own work?',
    rationale: 'Compares coping alternatives for the brave-choice tradeoff.',
  },
  'b4m4-68-q1': {
    questionText: 'Which regulation strategy best compares why a repeatable reset helps the brain?',
    rationale: 'Regulation comparison tied to the focus reset station.',
  },
  'b4m5-68-q1': {
    questionText: 'Which regulation step fits best before discussing the problem?',
    rationale: 'Regulation-before-discussion sequence for calm-down countdown.',
  },
  'b4m6-68-q3': {
    questionText: 'Which coping strategy best compares ways to repair trust after a mistake?',
    rationale: 'Compares coping/repair strategies in the oops lab.',
  },
  'b4m7-68-q2': {
    questionText: 'Which coping strategy fits best when a learning feeling needs kind self-talk?',
    rationale: 'Coping and self-awareness for the confidence charger mission.',
  },
  'b4m8-68-q1': {
    questionText: 'Which regulation sequence best compares notice, name, pause, choose, and reflect?',
    rationale: 'Compares the full regulation sequence from the focus flame.',
  },
};

const ZEKE_BEFORE = {
  'zkm1-68-q3': {
    questionText: 'What leadership move helps most without ignoring anyone?',
    scenarioText:
      'Zeke walks into lunch and sees a table of kids playing a card game. There is one open seat, but nobody has noticed him yet. During the new table, Zeke listens to teammates, weighs two reasonable plans, and chooses the option that helps the group most. During the new table, Zeke listens to teammates, weighs two reasonable plans, and chooses the option that helps the group most.',
    choices: [
      'Invite them to ask together or save…',
      'A kind idea that skips hearing everyone out',
      'A fast choice that helps one person but not the…',
      'A choice that shuts teammates out',
    ],
  },
  'zkm6-68-q2': {
    questionText: 'What leadership move helps most without ignoring anyone?',
    scenarioText:
      'Zeke wants to try out for the talent show, but his stomach flips when he sees the signup sheet. His brain says, "Maybe we become invisible today." During the courage challenge, Zeke listens to teammates, weighs two reasonable plans, and chooses the option that helps the group most. During the courage challenge, Zeke listens to teammates, weighs two reasonable plans, and chooses the option that helps the group most.',
    choices: [
      'A kind idea that skips hearing everyone out',
      'A fast choice that helps one person but not the group',
      'A choice that shuts teammates out',
      'Choosing the step that matches what he values',
    ],
  },
} as const;

const ZEKE_AFTER = {
  'zkm1-68-q3': {
    questionText:
      'Which leadership plan best compares inviting the other student with joining the table?',
    scenarioText:
      'Zeke walks into lunch and sees a table of kids playing a card game. There is one open seat, but nobody has noticed him yet. Another student hovers nearby too. Zeke compares two plans: ask to join while inviting the other student, or take the seat alone. During the new table, he weighs which leadership tradeoff helps the group without leaving anyone out.',
    choices: [
      'Invite them to ask together or save them a spot if the group says yes',
      'A kind idea that skips hearing everyone out',
      'A fast choice that helps one person but not the group',
      'A choice that shuts teammates out',
    ] as [string, string, string, string],
    rationale:
      'Adds explicit plan/tradeoff comparison in scenario and stem; restores truncated correct choice; clears lacks_reasoning_skill while preserving answer position.',
  },
  'zkm6-68-q2': {
    questionText:
      'Which courageous plan best compares performing on his values with skipping the tryout?',
    scenarioText:
      'Zeke wants to try out for the talent show, but his stomach flips when he sees the signup sheet. Friends in his project group are signing up around him. His brain says, "Maybe we become invisible today." He compares two plans: sign up now while nervous, or skip to protect himself from embarrassment. During the courage challenge, Zeke weighs which tradeoff best matches what he values.',
    rationale:
      'Replaces generic leadership stem with courage tradeoff reasoning; adds compare/plan language and group context for audit reasoning cues.',
  },
} as const;

export const CHARACTER_ALIGNMENT_FIXES: CharacterAlignmentFix[] = [
  ...CAIDEN_45_IDS.map((questionId) => ({
    questionId,
    character: 'caiden' as const,
    rationale: CAIDEN_RATIONALE,
    before: { questionText: CAIDEN_BEFORE_STEM },
    after: { questionText: CAIDEN_AFTER_STEM },
  })),
  ...Object.entries(B4_STEM_FIXES).map(([questionId, spec]) => ({
    questionId,
    character: 'b4' as const,
    rationale: spec.rationale,
    before: { questionText: B4_BEFORE_STEM },
    after: { questionText: spec.questionText },
  })),
  ...Object.entries(ZEKE_AFTER).map(([questionId, after]) => ({
    questionId,
    character: 'zeke' as const,
    rationale: after.rationale,
    before: ZEKE_BEFORE[questionId as keyof typeof ZEKE_BEFORE],
    after: {
      questionText: after.questionText,
      scenarioText: after.scenarioText,
      choices: 'choices' in after ? after.choices : undefined,
    },
  })),
];

export function buildCharacterAlignmentFixes(
  _overrides?: Record<string, StagingQuestionOverride>,
): CharacterAlignmentFix[] {
  return CHARACTER_ALIGNMENT_FIXES;
}

export function applyCharacterAlignmentFixes(
  overrides: Record<string, StagingQuestionOverride>,
  fixes: CharacterAlignmentFix[] = CHARACTER_ALIGNMENT_FIXES,
): number {
  let applied = 0;

  for (const fix of fixes) {
    const override = overrides[fix.questionId];
    if (!override) continue;

    override.questionText = fix.after.questionText;
    if (fix.after.scenarioText !== undefined) {
      override.scenarioText = fix.after.scenarioText;
    }
    if (fix.after.choices !== undefined) {
      override.choices = fix.after.choices;
    }
    if (!override.rewriteNotes.includes('v4 character alignment pass')) {
      override.rewriteNotes = `${override.rewriteNotes}; v4 character alignment pass`;
    }
    applied += 1;
  }

  return applied;
}

export const ALIGNMENT_TARGET_IDS = CHARACTER_ALIGNMENT_FIXES.map((f) => f.questionId);
