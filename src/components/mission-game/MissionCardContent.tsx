import React from 'react';
import type { GameQuestion } from '../../types/gameAssessment';
import ScenarioCard from '../../design-system/game/ScenarioCard';
import { resolveGameScenarioImage } from '../../design-system/game/gameScenarioAssets';
import { questionHasCaidenQuestGraphic } from '../caiden/CaidenQuestCard';
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
  useZekeHeader?: boolean;
  useB4Header?: boolean;
};

type MissionCardContentProps = MissionCardFlags & {
  question: GameQuestion;
  useCoachingRail?: boolean;
};

function resolveClueImageSrc(question: GameQuestion): string | undefined {
  const clueCard = question.clueCard;
  if (!clueCard || !('imageSrc' in clueCard)) return undefined;
  return clueCard.imageSrc;
}

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
  useCoachingRail = false,
  useVictoriaHeader = false,
  useUncleTHeader = false,
  useCaidenHeader = false,
  useMirandaHeader = false,
  useCharlieHeader = false,
  useZekeHeader = false,
  useB4Header = false,
}: MissionCardContentProps) {
  if (useCoachingRail && (question.clueCard || question.story)) {
    const storyPrompt = question.clueCard?.text ?? question.story ?? '';
    if (storyPrompt) {
      const scenarioImage = resolveGameScenarioImage({
        useCaidenHeader,
        useMirandaHeader,
        useCharlieHeader,
        useZekeHeader,
        useUncleTHeader,
        useVictoriaHeader,
        useB4Header,
        imageSrc: resolveClueImageSrc(question),
      });

      if (scenarioImage) {
        return (
          <ScenarioCard
            tag={question.clueCard?.tag}
            storyPrompt={storyPrompt}
            sceneImageSrc={scenarioImage.src}
            sceneImageAlt={scenarioImage.alt}
            sceneImageFit={scenarioImage.objectFit}
          />
        );
      }

      return (
        <ScenarioCard
          tag={question.clueCard?.tag}
          storyPrompt={storyPrompt}
        />
      );
    }
  }

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
