import type { B4LockInTipResult } from '../game/getB4LockInTip';
import {
  getGuidePanelLabel,
  getPreSubmitGuideMessage,
  type GuideCharacter,
} from '../game/getPreSubmitGuideMessage';
import type { GameFeedbackDetail } from '../../types/gameAssessment';

export type CoachReadAloudInput =
  | {
      state: 'placeholder';
      guideCharacter: GuideCharacter;
      phase?: 'landing' | 'quiz';
      hasSelection?: boolean;
      hasHints?: boolean;
    }
  | {
      state: 'lock_in';
      tip: B4LockInTipResult;
    }
  | {
      state: 'facilitator';
      title: string;
      headline: string;
      detail?: GameFeedbackDetail;
    };

function appendNumberedTips(segments: string[], label: string | undefined, tips: string[]): void {
  if (label?.trim()) segments.push(label.trim());
  tips.forEach((tip, index) => {
    if (tip.trim()) segments.push(`${index + 1}. ${tip.trim()}`);
  });
}

/** Narration for the coaching rail card in its current state. */
export function buildCoachCardReadAloudSegments(input: CoachReadAloudInput): string[] {
  const segments: string[] = [];

  switch (input.state) {
    case 'placeholder': {
      segments.push(getGuidePanelLabel(input.guideCharacter));
      const message = getPreSubmitGuideMessage({
        character: input.guideCharacter,
        phase: input.phase ?? 'quiz',
        hasSelection: input.hasSelection,
        hasHints: input.hasHints,
      });
      if (message.trim()) segments.push(message.trim());
      break;
    }
    case 'lock_in': {
      const { tip } = input;
      if (tip.title?.trim()) segments.push(tip.title.trim());
      if (tip.headline?.trim()) segments.push(tip.headline.trim());
      if (tip.body?.trim()) segments.push(tip.body.trim());
      appendNumberedTips(segments, tip.tipsLabel, tip.tips ?? []);
      break;
    }
    case 'facilitator': {
      if (input.title?.trim()) segments.push(input.title.trim());
      if (input.headline?.trim()) segments.push(input.headline.trim());
      if (input.detail?.whyItMatters?.trim()) segments.push(input.detail.whyItMatters.trim());
      appendNumberedTips(
        segments,
        input.detail?.tryThisLabel ?? 'Try this',
        input.detail?.tryThis ?? [],
      );
      if (input.detail?.watchFor?.trim()) segments.push(input.detail.watchFor.trim());
      break;
    }
  }

  return segments;
}

/** Mirrors AssessmentCoachRail placeholder vs post-check insight states. */
export function buildAssessmentCoachRailSegments(input: {
  guideCharacter: GuideCharacter;
  checked?: boolean;
  feedback?: string | null;
  hasSelection?: boolean;
  hasHints?: boolean;
  phase?: 'landing' | 'quiz';
  detail?: GameFeedbackDetail;
}): string[] {
  if (input.checked && input.feedback?.trim()) {
    return buildCoachCardReadAloudSegments({
      state: 'facilitator',
      title: getGuidePanelLabel(input.guideCharacter),
      headline: input.feedback,
      detail: input.detail,
    });
  }

  return buildCoachCardReadAloudSegments({
    state: 'placeholder',
    guideCharacter: input.guideCharacter,
    phase: input.phase,
    hasSelection: input.hasSelection,
    hasHints: input.hasHints,
  });
}
