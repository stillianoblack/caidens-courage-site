import React, { useMemo, useRef } from 'react';
import type { GameAnswerValue, GameQuestion } from '../../types/gameAssessment';
import {
  isGameAnswerComplete,
  isGameAnswerCorrect,
} from '../../lib/gameAssessmentValidation';
import GameCoachingRailPlaceholder from '../../design-system/game/GameCoachingRailPlaceholder';
import LearningMomentCard from '../../design-system/game/LearningMomentCard';
import { buildB4LockInTipFromGame, type B4LockInPortalType } from '../../design-system/game/getB4LockInTip';
import { usesB4LockInFeedback } from '../../design-system/game/feedbackRhythm';
import { useCoachingRailCaret } from '../../design-system/game/useCoachingRailCaret';
import type { ModuleTrackingDefinition } from '../../types/moduleTracking';
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
  coachingRailVariant?: 'b4' | 'facilitator';
  expertInsightTitle?: string;
  useVictoriaHeader?: boolean;
  useUncleTHeader?: boolean;
  useCaidenHeader?: boolean;
  useMirandaHeader?: boolean;
  useCharlieHeader?: boolean;
  gameId?: string;
  b4PortalType?: B4LockInPortalType;
  tracking?: ModuleTrackingDefinition | null;
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
  useLockInFeedback,
  useAdultLearningRhythm = false,
  coachingRailVariant = 'b4',
  expertInsightTitle,
  useVictoriaHeader = false,
  useUncleTHeader = false,
  useCaidenHeader = false,
  useMirandaHeader = false,
  useCharlieHeader = false,
  gameId,
  b4PortalType = 'facilitator',
  tracking,
  onPlaySelect,
  onSelectChoice,
  onSelectTrueFalse,
  onSequenceTap,
  onSequenceClear,
}: MissionQuizLayoutProps) {
  const answersWrapRef = useRef<HTMLDivElement>(null);
  const railShellRef = useRef<HTMLDivElement>(null);
  const caretTop = useCoachingRailCaret(answer, answersWrapRef, railShellRef);

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
  const useCoachingRail = lockInEnabled || useAdultLearningRhythm;
  const hasAnswer = isGameAnswerComplete(question, answer);
  const answerIsCorrect = hasAnswer && isGameAnswerCorrect(question, answer);
  const showLockInTip = Boolean(hasAnswer && lockInEnabled);
  const showFacilitatorInsight = Boolean(checked && feedback && useAdultLearningRhythm);
  const showLearningMoment = showLockInTip || showFacilitatorInsight;
  const showLegacyFeedback = Boolean(checked && feedback && !useCoachingRail);

  const facilitatorTitle =
    expertInsightTitle ?? (useUncleTHeader ? 'Uncle T Says' : 'Dr. Victoria Says');

  const lockInTip = useMemo(() => {
    if (!showLockInTip) return null;
    return buildB4LockInTipFromGame({
      portalType: b4PortalType,
      config: { id: gameId ?? question.id },
      question,
      answer,
      isCorrect: answerIsCorrect,
      tracking,
    });
  }, [showLockInTip, gameId, b4PortalType, question, answer, answerIsCorrect, tracking]);

  const layoutClass = [
    'bbc-quizWrap',
    'game-quizWrap',
    'mission-quizLayout',
    useCoachingRail ? 'mission-quizLayout--coachingRail' : '',
    hasMissionCard ? 'mission-quizLayout--hasMission' : '',
    quizWrapModifier,
  ]
    .filter(Boolean)
    .join(' ');

  const coachingRailContent = showLearningMoment ? (
    <>
      {showLockInTip && lockInTip ? (
        <LearningMomentCard
          variant={lockInTip.variant}
          title={lockInTip.title}
          headline={lockInTip.headline}
          body={lockInTip.body}
          tips={lockInTip.tips}
          tipsLabel={lockInTip.tipsLabel}
          showRailChevron
          caretTop={caretTop}
        />
      ) : null}
      {showFacilitatorInsight ? (
        <LearningMomentCard
          variant="FACILITATOR_INSIGHT"
          title={facilitatorTitle}
          headline={feedback!}
          avatarSrc={guideAvatarSrc ?? avatarSrc}
          whyItMatters={detail?.whyItMatters}
          tryThis={detail?.tryThis ? [...detail.tryThis] : undefined}
          tryThisLabel={detail?.tryThisLabel}
          watchFor={detail?.watchFor}
          showRailChevron
          caretTop={caretTop}
        />
      ) : null}
    </>
  ) : (
    <GameCoachingRailPlaceholder variant={coachingRailVariant} caretTop={caretTop} />
  );

  if (!useCoachingRail) {
    return (
      <div className={layoutClass}>
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
      </div>
    );
  }

  return (
    <div className={layoutClass}>
      {hasMissionCard && avatarSrc ? (
        <div className="mission-quizLayoutMission">
          <MissionSpeechRow avatarSrc={avatarSrc} avatarAlt={avatarAlt} theme={theme}>
            <MissionCardContent question={question} {...cardFlags} />
          </MissionSpeechRow>
        </div>
      ) : null}

      <div className="mission-quizLayoutLearning">
        <h2 className="bbc-questionText mission-questionText" id="game-question">
          {question.question ?? question.prompt}
        </h2>
        <div className="mission-quizLayoutAnswers" ref={answersWrapRef}>
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
        </div>
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
      </div>

      <aside className="mission-quizLayoutAside">
        <div ref={railShellRef} className="mission-quizLayoutAsideInner">
          {coachingRailContent}
        </div>
      </aside>
    </div>
  );
}
