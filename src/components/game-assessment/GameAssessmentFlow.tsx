import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import B4BaselineBottomBar from '../b4-baseline-check/B4BaselineBottomBar';
import '../b4-baseline-check/b4-baseline-check.css';
import './miranda-game.css';
import '../miranda/detective-notebook.css';
import '../miranda/miranda-clue-cards.css';
import '../miranda/miranda-trail-notebook.css';
import { useBaselineCheckSounds } from '../../hooks/useBaselineCheckSounds';
import { getGamePromptHint } from '../../lib/gameAssessmentPrompts';
import type { GameAnswerValue, GameAssessmentConfig } from '../../types/gameAssessment';
import {
  getGameQuestionFeedback,
  isGameAnswerComplete,
} from '../../lib/gameAssessmentValidation';
import GameAssessmentComplete from './GameAssessmentComplete';
import GameQuestionRenderer from './GameQuestionRenderer';
import MissingLetterPassage, { passageUsesMissingBlanks } from './MissingLetterPassage';
import CharacterPromptBubble from './shared/CharacterPromptBubble';
import GameBackgroundDecor from './shared/GameBackgroundDecor';
import GameHeader from './shared/GameHeader';
import MirandaGameHeader from './MirandaGameHeader';
import MirandaAvatar from '../miranda/MirandaAvatar';
import MirandaNavButton from '../miranda/MirandaNavButton';
import MirandaClueCard, { questionHasMirandaClueGraphic } from '../miranda/MirandaClueCard';
import CaidenGameHeader from '../caiden/CaidenGameHeader';
import CaidenQuestCard, { questionHasCaidenQuestGraphic } from '../caiden/CaidenQuestCard';
import { getCaidenNextQuest } from '../../data/caiden/progression';
import { getMirandaNextCase, MIRANDA_RETURN_HUB_LABEL } from '../../data/miranda/progression';
import '../caiden/caiden-game.css';

type GameView = 'landing' | 'quiz' | 'complete';

type GameAssessmentFlowProps = {
  config: GameAssessmentConfig;
  themeClassName?: string;
  exitPath?: string;
  /** Floating Miranda header (no white bar) */
  useMirandaHeader?: boolean;
  /** Floating Caiden focus quest header */
  useCaidenHeader?: boolean;
  /** Render inside Family Portal content area */
  embedded?: boolean;
  /** Jump straight into quiz (skip landing) */
  skipLanding?: boolean;
  /** Secondary exit to family portal on completion */
  familyPortalPath?: string;
};

function emptyAnswer(): GameAnswerValue {
  return null;
}

export default function GameAssessmentFlow({
  config,
  themeClassName = '',
  exitPath = '/',
  useMirandaHeader = false,
  useCaidenHeader = false,
  embedded = false,
  skipLanding = false,
  familyPortalPath,
}: GameAssessmentFlowProps) {
  const navigate = useNavigate();
  const totalQuestions = config.questions.length;
  const {
    soundEnabled,
    toggleSound,
    playSelect,
    playItemButton,
    playContinue,
    playModuleWin,
    playResultFeelings,
  } = useBaselineCheckSounds();

  const [view, setView] = useState<GameView>(skipLanding ? 'quiz' : 'landing');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<GameAnswerValue>(emptyAnswer());
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'try' | 'neutral'>('neutral');
  const [score, setScore] = useState(0);

  const currentQuestion = config.questions[questionIndex];
  const quizAvatarSrc = config.quizAvatarSrc ?? config.avatarSrc ?? '';
  const decorVariant =
    config.decorVariant ??
    (themeClassName.includes('miranda') ? 'miranda' : themeClassName.includes('caiden') ? 'caiden' : 'default');

  useEffect(() => {
    document.title = `${config.landing.title} | Caiden's Courage`;
  }, [config.landing.title]);

  const progressPct = useMemo(() => {
    if (view === 'complete') return 100;
    if (view === 'landing') return 0;
    const step = checked ? questionIndex + 1 : questionIndex;
    return Math.round((step / totalQuestions) * 100);
  }, [checked, questionIndex, totalQuestions, view]);

  const resetQuestionState = useCallback(() => {
    setAnswer(emptyAnswer());
    setChecked(false);
    setFeedback(null);
    setFeedbackTone('neutral');
  }, []);

  const handleExit = () => {
    if (view === 'quiz') {
      playItemButton();
      if (skipLanding) {
        navigate(exitPath);
        return;
      }
      setView('landing');
      setQuestionIndex(0);
      setScore(0);
      resetQuestionState();
      return;
    }
    if (view === 'complete') {
      playItemButton();
      navigate(exitPath);
      return;
    }
    navigate(exitPath);
  };

  const handleStart = () => {
    playSelect();
    setView('quiz');
    setQuestionIndex(0);
    setScore(0);
    resetQuestionState();
  };

  const handleCheck = () => {
    if (!currentQuestion || !isGameAnswerComplete(currentQuestion, answer)) return;

    playSelect();
    const result = getGameQuestionFeedback(currentQuestion, answer);
    setChecked(true);
    setFeedback(result.message);
    setFeedbackTone(result.correct ? 'success' : 'try');
    if (result.correct) {
      setScore((prev) => prev + 1);
      playResultFeelings();
    }
  };

  const handleContinue = () => {
    playContinue();
    if (questionIndex + 1 >= totalQuestions) {
      playModuleWin();
      setView('complete');
      resetQuestionState();
      return;
    }
    setQuestionIndex((index) => index + 1);
    resetQuestionState();
  };

  const handleSkip = () => {
    playItemButton();
    if (questionIndex + 1 >= totalQuestions) {
      setView('complete');
      resetQuestionState();
      return;
    }
    setQuestionIndex((index) => index + 1);
    resetQuestionState();
  };

  const handlePlayAgain = () => {
    playItemButton();
    setView('landing');
    setQuestionIndex(0);
    setScore(0);
    resetQuestionState();
  };

  const canCheck = currentQuestion ? isGameAnswerComplete(currentQuestion, answer) : false;
  const showTopBar = view !== 'landing';
  const showMirandaHubReturn = view === 'landing' && exitPath !== '/' && useMirandaHeader;
  const showLegacyHubBackLink = view === 'landing' && exitPath !== '/' && !useMirandaHeader;
  const nextCase = useMirandaHeader ? getMirandaNextCase(config.id) : null;
  const nextQuest = useCaidenHeader ? getCaidenNextQuest(config.id) : null;
  const presentationStyle = config.presentationStyle ?? 'default';
  const isNotebookPresentation = presentationStyle === 'detective_notebook';
  const isTrailPresentation = presentationStyle === 'trail_notebook';

  const quizWrapModifier = useMemo(() => {
    switch (presentationStyle) {
      case 'detective_notebook':
        return 'game-quizWrap--notebook';
      case 'trail_notebook':
        return 'game-quizWrap--trailNotebook';
      case 'case_file':
        return 'game-quizWrap--caseFile';
      case 'grammar_board':
        return 'game-quizWrap--grammarBoard';
      case 'missing_letter':
        return 'game-quizWrap--missingLetter';
      case 'focus_quest':
        return 'game-quizWrap--focusQuest';
      default:
        return '';
    }
  }, [presentationStyle]);

  const hasClueGraphic = currentQuestion
    ? useCaidenHeader
      ? questionHasCaidenQuestGraphic(currentQuestion)
      : questionHasMirandaClueGraphic(currentQuestion)
    : false;

  const shellClass = [
    'bbc-app',
    themeClassName,
    embedded ? `${themeClassName}--embedded` : '',
  ]
    .filter(Boolean)
    .join(' ');
  const HeaderComponent = useCaidenHeader
    ? CaidenGameHeader
    : useMirandaHeader
      ? MirandaGameHeader
      : GameHeader;

  return (
    <div className={shellClass}>
      <GameBackgroundDecor variant={decorVariant} />

      {showTopBar ? (
        <HeaderComponent
          progressPct={progressPct}
          onExit={handleExit}
          showProgress={view === 'quiz' || view === 'complete'}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      ) : null}

      <main className={`bbc-main${view === 'landing' ? ' bbc-main--landing' : ''}`}>
        {view === 'landing' ? (
          <div
            className={`bbc-landing game-landing${
              isNotebookPresentation
                ? ' game-landing--notebook'
                : isTrailPresentation
                  ? ' game-landing--trailNotebook'
                  : ''
            }`}
          >
            {showMirandaHubReturn ? (
              <MirandaNavButton
                to={exitPath}
                label={MIRANDA_RETURN_HUB_LABEL}
                variant="hub-return"
                onClick={playItemButton}
                className="game-hubReturnBtn"
              />
            ) : showLegacyHubBackLink ? (
              <Link to={exitPath} className="game-hubBackLink">
                ← Back to Mystery Files
              </Link>
            ) : null}
            <p className="bbc-eyebrow">{config.landing.eyebrow}</p>
            <h1 className="bbc-title">{config.landing.title}</h1>
            <p className="bbc-subtitle">{config.landing.subtitle}</p>
            {config.avatarSrc && useMirandaHeader ? (
              <MirandaAvatar
                variant="hero"
                src={config.avatarSrc}
                alt={config.avatarAlt}
                className="game-landingAvatar"
              />
            ) : config.avatarSrc ? (
              <div className="game-avatarHero">
                <img src={config.avatarSrc} alt={config.avatarAlt ?? ''} decoding="async" />
              </div>
            ) : null}
            <p className="bbc-body">{config.landing.body}</p>
            <button type="button" className="bbc-primaryBtn game-startBtn" onClick={handleStart}>
              {config.landing.cta}
            </button>
          </div>
        ) : null}

        {view === 'quiz' && currentQuestion ? (
          <div
            className={['bbc-quizWrap', 'game-quizWrap', quizWrapModifier].filter(Boolean).join(' ')}
          >
            {quizAvatarSrc ? (
              <CharacterPromptBubble
                avatarSrc={quizAvatarSrc}
                avatarAlt={config.avatarAlt}
                className={useCaidenHeader ? 'caiden-quizPrompt' : undefined}
                message={
                  useCaidenHeader
                    ? 'Choose the best answer, then tap Check.'
                    : getGamePromptHint(currentQuestion)
                }
              />
            ) : null}

            {hasClueGraphic ? (
              useCaidenHeader && currentQuestion.clueCard?.variant === 'focus_quest' ? (
                <CaidenQuestCard
                  label={currentQuestion.clueCard.label}
                  tag={currentQuestion.clueCard.tag}
                  text={currentQuestion.clueCard.text}
                  accent={
                    currentQuestion.clueCard.variant === 'focus_quest'
                      ? currentQuestion.clueCard.accent
                      : undefined
                  }
                />
              ) : (
                <MirandaClueCard question={currentQuestion} />
              )
            ) : currentQuestion.story ? (
              passageUsesMissingBlanks(currentQuestion.type, currentQuestion.story) ? (
                <MissingLetterPassage
                  text={currentQuestion.story}
                  className="bbc-passage game-storyPassage game-storyPassage--blanks"
                />
              ) : (
                <div className="bbc-passage game-storyPassage">{currentQuestion.story}</div>
              )
            ) : null}

            <h2 className="bbc-questionText" id="game-question">
              {currentQuestion.question ?? currentQuestion.prompt}
            </h2>

            <GameQuestionRenderer
              question={currentQuestion}
              answer={answer}
              checked={checked}
              onPlaySelect={playSelect}
              onSelectChoice={(id) => setAnswer(id)}
              onSelectTrueFalse={(value) => setAnswer(value)}
              onSequenceTap={(id) => {
                setAnswer((prev) => {
                  const order = Array.isArray(prev) ? [...prev] : [];
                  if (order.includes(id)) return order;
                  return [...order, id];
                });
              }}
              onSequenceClear={() => setAnswer([])}
            />
          </div>
        ) : null}

        {view === 'complete' ? (
          <GameAssessmentComplete
            config={config.complete}
            score={score}
            total={totalQuestions}
            onPlayAgain={handlePlayAgain}
            onExit={() => {
              playItemButton();
              navigate(exitPath);
            }}
            showMirandaAvatar={useMirandaHeader}
            showCaidenAvatar={useCaidenHeader}
            avatarSrc={config.avatarSrc}
            avatarAlt={config.avatarAlt}
            hubPath={useMirandaHeader || useCaidenHeader ? exitPath : undefined}
            nextCasePath={nextCase?.path ?? nextQuest?.path}
            nextCaseLabel={nextCase?.label ?? nextQuest?.label}
            familyPortalPath={useCaidenHeader ? familyPortalPath : undefined}
            scoreLabel={useCaidenHeader ? 'focus moments' : 'clues'}
            continueLabel={useCaidenHeader ? 'Continue Journey' : undefined}
            familyPortalLabel={useCaidenHeader ? 'Return to Family Portal' : undefined}
            onNavClick={playItemButton}
          />
        ) : null}
      </main>

      {view === 'quiz' ? (
        <B4BaselineBottomBar
          canCheck={canCheck}
          checked={checked}
          feedback={feedback}
          feedbackTone={feedbackTone}
          onSkip={handleSkip}
          onCheck={handleCheck}
          onContinue={handleContinue}
        />
      ) : null}
    </div>
  );
}
