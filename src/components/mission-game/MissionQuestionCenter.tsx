import React from 'react';
import type { GameQuestion } from '../../types/gameAssessment';
import {
  resolveGameplayQuestionPrompt,
  resolveGameplayScenarioText,
} from '../../lib/gameplayQuestionDisplay';
import MissionCardContent, { questionHasMissionCard } from './MissionCardContent';
import GameQuestionRenderer from '../game-assessment/GameQuestionRenderer';
import type { ComponentProps } from 'react';

type MissionCardFlags = {
  useVictoriaHeader?: boolean;
  useUncleTHeader?: boolean;
  useCaidenHeader?: boolean;
  useMirandaHeader?: boolean;
  useCharlieHeader?: boolean;
  useZekeHeader?: boolean;
  useB4Header?: boolean;
};

type MissionQuestionCenterProps = MissionCardFlags & {
  question: GameQuestion;
  questionPrompt?: string;
  cinematicMode?: boolean;
  answersRef?: React.RefObject<HTMLDivElement>;
  answerListClassName?: string;
  answerVariant?: ComponentProps<typeof GameQuestionRenderer>['answerVariant'];
  rendererProps: Omit<
    ComponentProps<typeof GameQuestionRenderer>,
    'question' | 'answerListClassName' | 'answerVariant'
  >;
};

function normalizeCopy(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function shouldShowSeparateQuestionPrompt(question: GameQuestion, questionPrompt: string): boolean {
  const prompt = questionPrompt.trim();
  if (!prompt) return false;

  const scenario = resolveGameplayScenarioText(question);
  if (!scenario) return true;

  return normalizeCopy(prompt) !== normalizeCopy(scenario);
}

/**
 * Unified mission question column:
 * top — scenario card, middle — question prompt (when separate), bottom — answers.
 */
export default function MissionQuestionCenter({
  question,
  questionPrompt: questionPromptProp,
  cinematicMode = false,
  answersRef,
  answerListClassName,
  answerVariant,
  rendererProps,
  ...cardFlags
}: MissionQuestionCenterProps) {
  const hasMissionCard = questionHasMissionCard(question, cardFlags);
  const questionPrompt = questionPromptProp ?? resolveGameplayQuestionPrompt(question);
  const showSeparateQuestion = shouldShowSeparateQuestionPrompt(question, questionPrompt);
  const questionHeadingClass = [
    'bbc-questionText',
    'mission-questionText',
    cinematicMode && hasMissionCard && !showSeparateQuestion ? 'cinematicMissionQuestionSrOnly' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const answersBlockClass = [
    cinematicMode ? 'cinematicMissionAnswersBlock' : 'mission-quizLayoutAnswers',
  ].join(' ');

  return (
    <>
      {hasMissionCard ? (
        <div
          className={[
            'mission-quizLayoutScenario',
            cinematicMode ? 'mission-questionCenterScenario' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <MissionCardContent question={question} useCoachingRail {...cardFlags} />
        </div>
      ) : null}
      {questionPrompt ? (
        <h2 className={questionHeadingClass} id="game-question">
          {questionPrompt}
        </h2>
      ) : (
        <h2 id="game-question" className="cinematicMissionQuestionSrOnly">
          Question
        </h2>
      )}
      <div className={answersBlockClass} ref={answersRef}>
        <GameQuestionRenderer
          key={question.id}
          question={question}
          answerListClassName={answerListClassName}
          answerVariant={answerVariant}
          {...rendererProps}
        />
      </div>
    </>
  );
}
