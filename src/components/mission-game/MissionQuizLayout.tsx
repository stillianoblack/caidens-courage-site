import React from 'react';
import type { GameAnswerValue, GameQuestion } from '../../types/gameAssessment';
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
  answer: GameAnswerValue;
  checked: boolean;
  feedback: string | null;
  feedbackTone: 'success' | 'try' | 'neutral';
  quizWrapModifier?: string;
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
  answer,
  checked,
  feedback,
  feedbackTone,
  quizWrapModifier = '',
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

  return (
    <div className={['bbc-quizWrap', 'game-quizWrap', 'mission-quizLayout', quizWrapModifier].filter(Boolean).join(' ')}>
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

      {checked && feedback ? (
        <MissionFeedbackCard
          theme={theme}
          avatarSrc={feedbackAvatarSrc}
          avatarAlt={feedbackAvatarAlt}
          speakerLabel={speakerLabel}
          message={feedback}
          tone={feedbackTone}
          detail={useVictoriaHeader || useUncleTHeader || useCharlieHeader ? detail : undefined}
        />
      ) : null}
    </div>
  );
}
