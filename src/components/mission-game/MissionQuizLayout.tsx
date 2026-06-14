import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { GameAnswerValue, GameQuestion } from '../../types/gameAssessment';
import {
  isGameAnswerComplete,
  isGameAnswerCorrect,
} from '../../lib/gameAssessmentValidation';
import GuideFeedbackCard from '../../design-system/game/GuideFeedbackCard';
import type { GuideFeedbackTone } from '../../design-system/game/GuideFeedbackCard';
import type { GameUIPatternId } from '../../design-system/game/patterns/gameUIPatterns';
import GameCoachingRailPlaceholder from '../../design-system/game/GameCoachingRailPlaceholder';
import LearningMomentCard from '../../design-system/game/LearningMomentCard';
import { buildB4LockInTipFromGame, type B4LockInPortalType } from '../../design-system/game/getB4LockInTip';
import { usesB4LockInFeedback } from '../../design-system/game/feedbackRhythm';
import { useCoachingRailCaret } from '../../design-system/game/useCoachingRailCaret';
import {
  buildCoachCardReadAloudSegments,
  buildGameplayReadAloudSegments,
  buildReadAloudSegmentsFromGameQuestion,
  GameCoachingRailAside,
} from '../../design-system/narration';
import type { ModuleTrackingDefinition } from '../../types/moduleTracking';
import GameQuestionRenderer from '../game-assessment/GameQuestionRenderer';
import MissionCardContent, { questionHasMissionCard } from './MissionCardContent';
import MissionFeedbackCard from './MissionFeedbackCard';
import MissionSpeechRow, { type MissionGameTheme } from './MissionSpeechRow';
import { resolveGameplayQuestionPrompt } from '../../lib/gameplayQuestionDisplay';
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
  useZekeHeader?: boolean;
  useB4Header?: boolean;
  gameId?: string;
  b4PortalType?: B4LockInPortalType;
  tracking?: ModuleTrackingDefinition | null;
  revealCorrectAnswer?: boolean;
  activeHint?: string | null;
  patternId?: GameUIPatternId;
  attachActionsToFeedback?: boolean;
  canTryAgain?: boolean;
  canUseHint?: boolean;
  canExplainMore?: boolean;
  showExplainMore?: boolean;
  onContinue?: () => void;
  continueBusy?: boolean;
  onTryAgain?: () => void;
  onUseHint?: () => void;
  onToggleExplainMore?: () => void;
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
  useZekeHeader = false,
  useB4Header = false,
  gameId,
  b4PortalType = 'facilitator',
  tracking,
  revealCorrectAnswer = false,
  activeHint,
  patternId,
  attachActionsToFeedback = false,
  canTryAgain = false,
  canUseHint = false,
  canExplainMore = false,
  showExplainMore = false,
  onContinue,
  continueBusy = false,
  onTryAgain,
  onUseHint,
  onToggleExplainMore,
  onPlaySelect,
  onSelectChoice,
  onSelectTrueFalse,
  onSequenceTap,
  onSequenceClear,
}: MissionQuizLayoutProps) {
  const answersWrapRef = useRef<HTMLDivElement>(null);
  const railShellRef = useRef<HTMLDivElement>(null);
  const caretTop = useCoachingRailCaret(answer, answersWrapRef, railShellRef);
  const [compactMobile, setCompactMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 719px)');
    const update = () => setCompactMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const questionPrompt = useMemo(() => resolveGameplayQuestionPrompt(question), [question]);

  const cardFlags = {
    useVictoriaHeader,
    useUncleTHeader,
    useCaidenHeader,
    useMirandaHeader,
    useCharlieHeader,
    useZekeHeader,
    useB4Header,
  };
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
  const answerIsCorrect = checked && isGameAnswerCorrect(question, answer);
  /** Lock-in tips only after Check — never on select (commit-before-feedback). */
  const showLockInTip = Boolean(checked && lockInEnabled);
  const showFacilitatorInsight = Boolean(checked && feedback && useAdultLearningRhythm);
  const showLearningMoment = showLockInTip || showFacilitatorInsight;
  const showLegacyFeedback = Boolean(checked && feedback && !useCoachingRail);

  const facilitatorTitle =
    expertInsightTitle ?? (useUncleTHeader ? 'Uncle T Says' : 'Dr. Victoria Says');

  const preCheckGuideCharacter = useUncleTHeader
    ? 'uncle-t'
    : useVictoriaHeader
      ? 'dr-victoria'
      : 'b4';

  const lockInTip = useMemo(() => {
    if (!showLockInTip) return null;
    return buildB4LockInTipFromGame({
      portalType: b4PortalType,
      config: { id: gameId ?? question.id },
      question,
      answer,
      isCorrect: answerIsCorrect,
      revealCorrectAnswer: revealCorrectAnswer || answerIsCorrect,
      tracking,
    });
  }, [
    showLockInTip,
    gameId,
    b4PortalType,
    question,
    answer,
    answerIsCorrect,
    revealCorrectAnswer,
    tracking,
  ]);

  const readAloudSegments = useMemo(() => {
    const questionSegments = buildReadAloudSegmentsFromGameQuestion(question);

    let coachSegments: string[] = [];
    if (showLockInTip && lockInTip) {
      coachSegments = buildCoachCardReadAloudSegments({ state: 'lock_in', tip: lockInTip });
    } else if (showFacilitatorInsight && feedback) {
      coachSegments = buildCoachCardReadAloudSegments({
        state: 'facilitator',
        title: facilitatorTitle,
        headline: feedback,
        detail,
      });
    } else {
      coachSegments = buildCoachCardReadAloudSegments({
        state: 'placeholder',
        guideCharacter: preCheckGuideCharacter,
        hasSelection: hasAnswer,
        hasHints: Boolean(question.hints?.length),
      });
    }

    const scope = checked ? 'coach_only' : 'full';
    return buildGameplayReadAloudSegments(questionSegments, coachSegments, scope);
  }, [
    checked,
    detail,
    facilitatorTitle,
    feedback,
    hasAnswer,
    lockInTip,
    preCheckGuideCharacter,
    question,
    showFacilitatorInsight,
    showLockInTip,
  ]);

  const readAloudResetKey = [
    question.id,
    checked ? 'checked' : 'open',
    showLockInTip ? 'lock-in' : showFacilitatorInsight ? 'insight' : 'coach',
    showLockInTip && lockInTip ? lockInTip.headline : '',
  ].join('::');

  const layoutClass = [
    'bbc-quizWrap',
    'game-quizWrap',
    'mission-quizLayout',
    useCoachingRail ? 'mission-quizLayout--coachingRail' : '',
    hasMissionCard && !useCoachingRail ? 'mission-quizLayout--hasMission' : '',
    quizWrapModifier,
  ]
    .filter(Boolean)
    .join(' ');

  const guideFeedbackTone: GuideFeedbackTone =
    feedbackTone === 'success' ? 'success' : feedbackTone === 'try' ? 'incorrect' : 'neutral';

  const renderLockInFeedback = () => {
    if (!showLockInTip || !lockInTip) return null;
    const learningMoment = {
      variant: lockInTip.variant,
      title: lockInTip.title,
      headline: lockInTip.headline,
      body: lockInTip.body,
      tips: lockInTip.tips,
      tipsLabel: lockInTip.tipsLabel,
      showRailChevron: true,
      caretTop,
    } as const;

    if (attachActionsToFeedback) {
      return (
        <GuideFeedbackCard
          tone={guideFeedbackTone}
          learningMoment={learningMoment}
          showContinue={checked && !canTryAgain}
          onContinue={onContinue}
          continueLabel={continueBusy ? 'Saving…' : 'Continue'}
          continueDisabled={continueBusy}
          showTryAgain={canTryAgain}
          onTryAgain={onTryAgain}
          showHint={canUseHint}
          onHint={onUseHint}
          canExplainMore={canExplainMore}
          showExplainMore={showExplainMore}
          onToggleExplainMore={onToggleExplainMore}
        />
      );
    }

    return (
      <div
        className={['ds-guideFeedback', `ds-guideFeedback--${guideFeedbackTone}`]
          .filter(Boolean)
          .join(' ')}
      >
        <LearningMomentCard {...learningMoment} className="ds-guideFeedbackCard" collapsibleOnMobile={compactMobile} />
        {canExplainMore && showExplainMore && question.explainMore ? (
          <p className="ds-guideFeedbackExplain">{question.explainMore}</p>
        ) : null}
      </div>
    );
  };

  const renderFacilitatorFeedback = () => {
    if (!showFacilitatorInsight) return null;
    const learningMoment = {
      variant: 'FACILITATOR_INSIGHT' as const,
      title: facilitatorTitle,
      headline: feedback!,
      avatarSrc: guideAvatarSrc ?? avatarSrc,
      whyItMatters: detail?.whyItMatters,
      tryThis: detail?.tryThis ? [...detail.tryThis] : undefined,
      tryThisLabel: detail?.tryThisLabel,
      watchFor: detail?.watchFor,
      showRailChevron: true,
      caretTop,
    };

    if (attachActionsToFeedback) {
      return (
        <GuideFeedbackCard
          tone={guideFeedbackTone}
          learningMoment={learningMoment}
          showContinue={checked && !canTryAgain}
          onContinue={onContinue}
          continueLabel={continueBusy ? 'Saving…' : 'Continue'}
          continueDisabled={continueBusy}
        />
      );
    }

    return <LearningMomentCard {...learningMoment} />;
  };

  const coachingRailContent = showLearningMoment ? (
    <>
      {renderLockInFeedback()}
      {renderFacilitatorFeedback()}
    </>
  ) : (
    <GameCoachingRailPlaceholder
      guideCharacter={preCheckGuideCharacter}
      caretTop={caretTop}
      hasSelection={hasAnswer}
      hasHints={Boolean(question.hints?.length)}
    />
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
          {questionPrompt}
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
      {!useCoachingRail && hasMissionCard && avatarSrc ? (
        <div className="mission-quizLayoutMission">
          <MissionSpeechRow avatarSrc={avatarSrc} avatarAlt={avatarAlt} theme={theme}>
            <MissionCardContent question={question} {...cardFlags} />
          </MissionSpeechRow>
        </div>
      ) : null}

      <div className="mission-quizLayoutLearning">
        {useCoachingRail && hasMissionCard ? (
          <div className="mission-quizLayoutScenario">
            <MissionCardContent question={question} useCoachingRail {...cardFlags} />
          </div>
        ) : null}
        <h2 className="bbc-questionText mission-questionText" id="game-question">
          {questionPrompt}
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
        <GameCoachingRailAside
          asideInnerRef={railShellRef}
          coachContent={coachingRailContent}
          readAloudSegments={readAloudSegments}
          readAloudResetKey={readAloudResetKey}
          readAloudPlayAriaLabel={
            checked ? 'Read coach feedback aloud' : 'Read this question aloud'
          }
          showReadAloud={!compactMobile}
        />
      </aside>
    </div>
  );
}
