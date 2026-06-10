import React from 'react';
import type { GameAnswerValue, GameQuestion } from '../../types/gameAssessment';
import LearningMomentCard from '../../design-system/game/LearningMomentCard';
import {
  resolveLockInTips,
  shouldShowExpertInsight,
  usesB4LockInFeedback,
} from '../../design-system/game/feedbackRhythm';
import GameQuestionRenderer from '../game-assessment/GameQuestionRenderer';
import MissionCardContent, { questionHasMissionCard } from './MissionCardContent';
import MissionFeedbackCard from './MissionFeedbackCard';
import MissionSpeechRow, { type MissionGameTheme } from './MissionSpeechRow';
import './mission-game.css';

type MissionQuizLayoutProps = {
  theme: MissionGameTheme;
  avatarSrc: string;
  avatarAlt?: string;
  guideAvatarSrc?: string;
  guideAvatarAlt?: string;
  speakerLabel: string;
  question: GameQuestion;
  questionIndex?: number;
  answer: GameAnswerValue;
  checked: boolean;
  feedback: string | null;
  feedbackTone: 'success' | 'try' | 'neutral';
  quizWrapModifier?: string;
  useLockInFeedback?: boolean;
  useAdultLearningRhythm?: boolean;
  useVictoriaHeader?: boolean;
  useUncleTHeader?: boolean;
  useCaidenHeader?: boolean;
  useMirandaHeader?: boolean;
  useCharlieHeader?: boolean;
  onPlaySelect: () => void;
  onSelectChoice: (id: string) => void;
  onSelectTrueFalse: (value: boolean) => void;
  onSequenceTap: (id: string) => void;
  onSequenceClear: () => void;
};

export default function MissionQuizLayout({
  theme,
  avatarSrc,
  avatarAlt,
  guideAvatarSrc,
  guideAvatarAlt,
  speakerLabel,
  question,
  questionIndex = 0,
  answer,
  checked,
  feedback,
  feedbackTone,
  quizWrapModifier = '',
  useLockInFeedback,
  useAdultLearningRhythm = false,
  useVictoriaHeader = false,
  useUncleTHeader = false,
  useCaidenHeader = false,
  useMirandaHeader = false,
  useCharlieHeader = false,
  onPlaySelect,
  onSelectChoice,
  onSelectTrueFalse,
  onSequenceTap,
  onSequenceClear,
}: MissionQuizLayoutProps) {
  const cardFlags = { useVictoriaHeader, useUncleTHeader, useCaidenHeader, useMirandaHeader, useCharlieHeader };
  const hasMissionCard = questionHasMissionCard(question, cardFlags);
  const feedbackAvatarSrc = guideAvatarSrc ?? avatarSrc;
  const feedbackAvatarAlt = guideAvatarAlt ?? avatarAlt;
  const detail = checked
    ? feedbackTone === 'success'
      ? question.feedbackDetailCorrect ?? question.feedbackDetail
      : question.feedbackDetailIncorrect ?? question.feedbackDetail
    : undefined;

  const lockInEnabled = useLockInFeedback ?? usesB4LockInFeedback(theme);
  const showLockInTip = Boolean(checked && feedback && lockInEnabled);
  const showExpertInsight =
    Boolean(
      checked &&
        feedback &&
        useAdultLearningRhythm &&
        detail &&
        shouldShowExpertInsight(questionIndex),
    );
  const showLegacyFeedback = Boolean(
    checked && feedback && !showLockInTip && !showExpertInsight,
  );

  const showLearningMoment = showLockInTip || showExpertInsight;

  const layoutClass = [
    'bbc-quizWrap',
    'game-quizWrap',
    'mission-quizLayout',
    showLearningMoment ? 'mission-quizLayout--lockIn' : '',
    quizWrapModifier,
  ]
    .filter(Boolean)
    .join(' ');

  const quizBody = (
    <>
      {hasMissionCard && avatarSrc ? (
        <MissionSpeechRow avatarSrc={avatarSrc} avatarAlt={avatarAlt} theme={theme}>
          <MissionCardContent question={question} {...cardFlags} />
        </MissionSpeechRow>
      ) : null}

      <h2 className="bbc-questionText mission-questionText" id="game-question">
        {question.question ?? question.prompt}
      </h2>

      <GameQuestionRenderer
        question={question}
        answer={answer}
        checked={checked}
        onPlaySelect={onPlaySelect}
        onSelectChoice={onSelectChoice}
        onSelectTrueFalse={onSelectTrueFalse}
        onSequenceTap={onSequenceTap}
        onSequenceClear={onSequenceClear}
      />

      {showLegacyFeedback ? (
        <MissionFeedbackCard
          theme={theme}
          avatarSrc={feedbackAvatarSrc}
          avatarAlt={feedbackAvatarAlt}
          speakerLabel={speakerLabel}
          message={feedback!}
          tone={feedbackTone}
          detail={useVictoriaHeader || useUncleTHeader || useCharlieHeader ? detail : undefined}
        />
      ) : null}
    </>
  );

  return (
    <div className={layoutClass}>
      <div className="mission-quizLayoutMain">{quizBody}</div>
      {showLearningMoment ? (
        <div className="mission-quizLayoutAside">
          {showLockInTip ? (
            <LearningMomentCard
              variant="B4_LOCK_IN"
              headline={feedback!}
              tips={
                useAdultLearningRhythm
                  ? resolveLockInTips(question, feedbackTone).slice(0, 2)
                  : resolveLockInTips(question, feedbackTone)
              }
            />
          ) : null}
          {showExpertInsight ? (
            <LearningMomentCard
              variant="FACILITATOR_INSIGHT"
              headline={feedback!}
              whyItMatters={detail?.whyItMatters}
              tryThis={detail?.tryThis ? [...detail.tryThis] : undefined}
              tryThisLabel={detail?.tryThisLabel}
              watchFor={detail?.watchFor}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
