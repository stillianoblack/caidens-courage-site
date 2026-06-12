import React from 'react';
import { getCharacter } from '../characters/characterRegistry';
import GameCoachingRailPlaceholder from './GameCoachingRailPlaceholder';
import LearningMomentCard from './LearningMomentCard';
import { getGuidePanelLabel, type GuideCharacter } from './getPreSubmitGuideMessage';

export type AssessmentCoachRailProps = {
  guideCharacter: GuideCharacter;
  checked?: boolean;
  feedback?: string | null;
  feedbackTone?: 'success' | 'try' | 'neutral';
  hasSelection?: boolean;
  hasHints?: boolean;
  phase?: 'landing' | 'quiz';
};

function resolveRegistryId(character: GuideCharacter): string {
  switch (character) {
    case 'dr-victoria':
      return 'dr-victoria';
    case 'uncle-t':
      return 'uncle-t';
    default:
      return 'b4';
  }
}

/** Pre-check placeholder or post-check insight card for assessment flows. */
export default function AssessmentCoachRail({
  guideCharacter,
  checked = false,
  feedback = null,
  feedbackTone = 'neutral',
  hasSelection = false,
  hasHints = false,
  phase = 'quiz',
}: AssessmentCoachRailProps) {
  const label = getGuidePanelLabel(guideCharacter);

  if (checked && feedback) {
    const character = getCharacter(resolveRegistryId(guideCharacter));
    return (
      <LearningMomentCard
        variant="FACILITATOR_INSIGHT"
        title={label}
        headline={feedback}
        avatarSrc={character?.avatarSrc}
        showRailChevron={false}
        className={[
          'ds-guideFeedbackCard',
          feedbackTone === 'success' ? 'ds-guideFeedback--success' : '',
          feedbackTone === 'try' ? 'ds-guideFeedback--incorrect' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    );
  }

  return (
    <GameCoachingRailPlaceholder
      guideCharacter={guideCharacter}
      phase={phase}
      hasSelection={hasSelection}
      hasHints={hasHints}
    />
  );
}
