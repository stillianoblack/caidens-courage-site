import React from 'react';
import type { GameQuestion } from '../../types/gameAssessment';
import CaidenQuestCard, { questionHasCaidenQuestGraphic } from '../caiden/CaidenQuestCard';
import MirandaClueCard, { questionHasMirandaClueGraphic } from '../miranda/MirandaClueCard';
import VictoriaReflectionCard, { questionHasVictoriaReflectionGraphic } from '../adult/VictoriaReflectionCard';
import VictoriaFocusLabCard, { questionHasVictoriaFocusLabGraphic } from '../adult/VictoriaFocusLabCard';
import UncleTCoachingCard, { questionHasUncleTCoachingGraphic } from '../adult/UncleTCoachingCard';
import CharlieNatureCard, { questionHasCharlieNatureGraphic } from '../charlie/CharlieNatureCard';
import MissingLetterPassage, { passageUsesMissingBlanks } from '../game-assessment/MissingLetterPassage';

type MissionCardFlags = {
  useVictoriaHeader?: boolean;
  useUncleTHeader?: boolean;
  useCaidenHeader?: boolean;
  useMirandaHeader?: boolean;
  useCharlieHeader?: boolean;
};

type MissionCardContentProps = MissionCardFlags & {
  question: GameQuestion;
};

export function questionHasMissionCard(question: GameQuestion, flags: MissionCardFlags): boolean {
  if (flags.useVictoriaHeader && questionHasVictoriaReflectionGraphic(question)) return true;
  if (flags.useVictoriaHeader && questionHasVictoriaFocusLabGraphic(question)) return true;
  if (flags.useUncleTHeader && questionHasUncleTCoachingGraphic(question)) return true;
  if (flags.useCaidenHeader && questionHasCaidenQuestGraphic(question)) return true;
  if (flags.useCharlieHeader && questionHasCharlieNatureGraphic(question)) return true;
  if (flags.useMirandaHeader && questionHasMirandaClueGraphic(question)) return true;
  if (question.story) return true;
  return false;
}

export default function MissionCardContent({
  question,
  useVictoriaHeader = false,
  useUncleTHeader = false,
  useCaidenHeader = false,
  useMirandaHeader = false,
  useCharlieHeader = false,
}: MissionCardContentProps) {
  if (useCharlieHeader && question.clueCard?.variant === 'nature_card') {
    return (
      <CharlieNatureCard
        label={question.clueCard.label}
        tag={question.clueCard.tag}
        text={question.clueCard.text}
        accent={question.clueCard.accent}
      />
    );
  }

  if (useUncleTHeader && question.clueCard?.variant === 'coaching_card') {
    return (
      <UncleTCoachingCard
        label={question.clueCard.label}
        tag={question.clueCard.tag}
        text={question.clueCard.text}
        accent={question.clueCard.accent}
      />
    );
  }

  if (useVictoriaHeader && question.clueCard?.variant === 'reflection_card') {
    return (
      <VictoriaReflectionCard
        label={question.clueCard.label}
        tag={question.clueCard.tag}
        text={question.clueCard.text}
        accent={question.clueCard.accent}
      />
    );
  }

  if (useVictoriaHeader && question.clueCard?.variant === 'focus_lab') {
    return (
      <VictoriaFocusLabCard
        label={question.clueCard.label}
        tag={question.clueCard.tag}
        text={question.clueCard.text}
        accent={question.clueCard.accent}
      />
    );
  }

  if (useCaidenHeader && question.clueCard?.variant === 'focus_quest') {
    return (
      <CaidenQuestCard
        label={question.clueCard.label}
        tag={question.clueCard.tag}
        text={question.clueCard.text}
        accent={question.clueCard.accent}
      />
    );
  }

  if (useMirandaHeader && questionHasMirandaClueGraphic(question)) {
    return <MirandaClueCard question={question} />;
  }

  if (question.story) {
    if (passageUsesMissingBlanks(question.type, question.story)) {
      return (
        <MissingLetterPassage
          text={question.story}
          className="bbc-passage game-storyPassage game-storyPassage--blanks mission-storyPassage"
        />
      );
    }
    return <div className="bbc-passage game-storyPassage mission-storyPassage">{question.story}</div>;
  }

  return null;
}
