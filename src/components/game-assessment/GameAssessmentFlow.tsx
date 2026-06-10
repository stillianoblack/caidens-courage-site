import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import B4BaselineBottomBar from '../b4-baseline-check/B4BaselineBottomBar';
import '../b4-baseline-check/b4-baseline-check.css';
import './miranda-game.css';
import '../miranda/detective-notebook.css';
import '../miranda/miranda-clue-cards.css';
import '../miranda/miranda-trail-notebook.css';
import { useSetMissionGamePhase } from '../../context/MissionGamePhaseContext';
import { useBaselineCheckSounds } from '../../hooks/useBaselineCheckSounds';
import type { GameAnswerValue, GameAssessmentConfig } from '../../types/gameAssessment';
import {
  getGameQuestionFeedback,
  isGameAnswerComplete,
} from '../../lib/gameAssessmentValidation';
import GameAssessmentComplete from './GameAssessmentComplete';
import CharacterSpeechBubble from './shared/CharacterSpeechBubble';
import PortalBackButton from '../portal/PortalBackButton';
import GameInteractionShell from './shared/GameInteractionShell';
import GameBackgroundDecor from './shared/GameBackgroundDecor';
import GameHeader from './shared/GameHeader';
import MirandaGameHeader from './MirandaGameHeader';
import CaidenGameHeader from '../caiden/CaidenGameHeader';
import CharlieGameHeader from '../charlie/CharlieGameHeader';
import VictoriaGameHeader from '../adult/VictoriaGameHeader';
import UncleTGameHeader from '../adult/UncleTGameHeader';
import AdultMissionIntroGuide from '../adult-learning/AdultMissionIntroGuide';
import '../adult-learning/adult-mission-intro.css';
import type { AdultGuideThemeId } from '../../types/adultTraining';
import GameCoachingRailPlaceholder from '../../design-system/game/GameCoachingRailPlaceholder';
import { resolveB4PortalType } from '../../design-system/game/getB4LockInTip';
import SharedMissionGameLayout from '../mission-game/SharedMissionGameLayout';
import { getMissionIntroHint } from '../mission-game/missionIntroHints';
import type { MissionGameTheme } from '../mission-game/MissionSpeechRow';
import { getCaidenNextQuest } from '../../data/caiden/progression';
import { getMirandaNextCase } from '../../data/miranda/progression';
import { markAdultTrainingMissionComplete } from '../../lib/adultTrainingCompletion';
import { readActivePortalRole } from '../../config/portalContext';
import { readActiveChildNickname } from '../../config/activeChildNickname';
import { resolveModuleTracking } from '../../data/moduleTrackingRegistry';
import { trackEvent } from '../../lib/analytics';
import { recordInteractiveModuleCompletion } from '../../lib/recordInteractiveCompletion';
import {
  navigateGameExit,
  shouldGameplayExitImmediately,
} from '../../lib/gameExitNavigation';
import type { ModuleTrackingDefinition } from '../../types/moduleTracking';
import '../caiden/caiden-game.css';
import '../adult/adult-game.css';
import '../adult/uncle-t-game.css';
import '../mission-game/mission-game.css';
import '../charlie/charlie-game.css';

type GameView = 'landing' | 'quiz' | 'complete';

type GameAssessmentFlowProps = {
  config: GameAssessmentConfig;
  themeClassName?: string;
  exitPath?: string;
  /** Floating Miranda header (no white bar) */
  useMirandaHeader?: boolean;
  /** Floating Caiden focus quest header */
  useCaidenHeader?: boolean;
  /** Dr. Victoria adult training header */
  useVictoriaHeader?: boolean;
  /** Uncle T adult coaching header */
  useUncleTHeader?: boolean;
  /** Charlie Perk nature nook header */
  useCharlieHeader?: boolean;
  /** B-4 focus mission header */
  useB4Header?: boolean;
  /** Label for hub back link on landing */
  exitLabel?: string;
  /** Render inside Family Portal content area */
  embedded?: boolean;
  /** Jump straight into quiz (skip landing) */
  skipLanding?: boolean;
  /** Secondary exit to family portal on completion */
  familyPortalPath?: string;
  /** Secondary portal section exit (Adult Training / Parent Corner) */
  portalSectionPath?: string;
  portalSectionLabel?: string;
  /** Primary adult hub completion CTA label */
  adultHubContinueLabel?: string;
  /** @deprecated Use adultHubContinueLabel */
  victoriaHubContinueLabel?: string;
  /** Adult training guide id for completion tracking */
  adultGuideId?: string;
  /** Adult training mission id for completion tracking */
  adultMissionId?: string;
  /** Optional universal tracking metadata override */
  tracking?: ModuleTrackingDefinition;
};

function emptyAnswer(): GameAnswerValue {
  return null;
}

function getMissionTheme(flags: {
  useVictoriaHeader: boolean;
  useUncleTHeader: boolean;
  useCaidenHeader: boolean;
  useMirandaHeader: boolean;
  useCharlieHeader: boolean;
  useB4Header: boolean;
}): MissionGameTheme {
  if (flags.useVictoriaHeader) return 'victoria';
  if (flags.useUncleTHeader) return 'uncle-t';
  if (flags.useCaidenHeader) return 'caiden';
  if (flags.useMirandaHeader) return 'miranda';
  if (flags.useCharlieHeader) return 'charlie';
  if (flags.useB4Header) return 'b4';
  return 'default';
}

function getGuideHubTheme(flags: {
  useVictoriaHeader: boolean;
  useUncleTHeader: boolean;
}): AdultGuideThemeId | null {
  if (flags.useVictoriaHeader) return 'victoria';
  if (flags.useUncleTHeader) return 'uncle-t';
  return null;
}

function resolveHubBackName(flags: {
  useVictoriaHeader: boolean;
  useUncleTHeader: boolean;
  useCaidenHeader: boolean;
  useMirandaHeader: boolean;
  useCharlieHeader: boolean;
  useB4Header: boolean;
}): string {
  if (flags.useVictoriaHeader) return 'Learning Hub';
  if (flags.useUncleTHeader) return 'Coaching Hub';
  if (flags.useCaidenHeader) return 'Focus Flame Journey';
  if (flags.useMirandaHeader) return 'Mystery Files';
  if (flags.useCharlieHeader) return 'Nature Nook';
  if (flags.useB4Header) return 'B-4 Missions';
  return 'Character Hub';
}

function getFeedbackSpeakerLabel(theme: MissionGameTheme): string {
  switch (theme) {
    case 'victoria':
      return 'Dr. Victoria says';
    case 'uncle-t':
      return 'Uncle T says';
    case 'caiden':
      return 'Focus Tip';
    case 'miranda':
      return 'Detective Note';
    case 'charlie':
      return 'Charlie Says';
    case 'b4':
      return 'B-4 Says';
    default:
      return 'Coach says';
  }
}

export default function GameAssessmentFlow({
  config,
  themeClassName = '',
  exitPath = '/',
  useMirandaHeader = false,
  useCaidenHeader = false,
  useVictoriaHeader = false,
  useUncleTHeader = false,
  useCharlieHeader = false,
  useB4Header = false,
  embedded = false,
  skipLanding = false,
  familyPortalPath,
  portalSectionPath,
  portalSectionLabel,
  adultHubContinueLabel,
  victoriaHubContinueLabel = 'Continue Learning Hub',
  exitLabel,
  adultGuideId,
  adultMissionId,
  tracking,
}: GameAssessmentFlowProps) {
  const hubContinueLabel = adultHubContinueLabel ?? victoriaHubContinueLabel;
  const navigate = useNavigate();
  const { pathname: currentPathname } = useLocation();
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
  const [answersRecord, setAnswersRecord] = useState<Record<string, GameAnswerValue>>({});
  const quizStartedAtRef = useRef<number | null>(null);

  const currentQuestion = config.questions[questionIndex];
  const quizAvatarSrc = config.quizAvatarSrc ?? config.avatarSrc ?? '';
  const introAvatarSrc = quizAvatarSrc || config.avatarSrc || '';
  const decorVariant =
    config.decorVariant ??
    (themeClassName.includes('miranda')
      ? 'miranda'
      : themeClassName.includes('caiden')
        ? 'caiden'
        : themeClassName.includes('uncle-t')
          ? 'uncle-t'
          : themeClassName.includes('victoria')
            ? 'victoria'
            : 'default');
  const missionTheme = getMissionTheme({
    useVictoriaHeader,
    useUncleTHeader,
    useCaidenHeader,
    useMirandaHeader,
    useCharlieHeader,
    useB4Header,
  });
  const guideHubTheme = getGuideHubTheme({ useVictoriaHeader, useUncleTHeader });
  const useAdultGuideHeader = useVictoriaHeader || useUncleTHeader;

  useSetMissionGamePhase(view);

  useEffect(() => {
    document.title = `${config.landing.title} | Caiden's Courage`;
  }, [config.landing.title]);

  const emitGameStarted = useCallback(() => {
    const trackingMeta = tracking ?? resolveModuleTracking(config);
    const role = readActivePortalRole() ?? trackingMeta?.role ?? 'student';
    const isTraining = Boolean(adultGuideId && adultMissionId);

    if (isTraining) {
      trackEvent('training_module_started', {
        module_id: adultMissionId,
        module_title: config.landing.title,
        character: trackingMeta?.character,
        role,
      });
    }

    trackEvent('game_started', {
      game_id: config.id,
      game_title: config.landing.title,
      character: trackingMeta?.character,
      role,
    });
  }, [adultGuideId, adultMissionId, config, tracking]);

  useEffect(() => {
    if (skipLanding && view === 'quiz' && !quizStartedAtRef.current) {
      quizStartedAtRef.current = Date.now();
      emitGameStarted();
    }
  }, [emitGameStarted, skipLanding, view]);

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

  const handleExit = useCallback(() => {
    playItemButton();
    const exitImmediately = shouldGameplayExitImmediately(embedded, skipLanding);

    if (exitImmediately || view === 'complete') {
      navigateGameExit(navigate, exitPath, currentPathname);
      return;
    }

    if (view === 'quiz') {
      setView('landing');
      setQuestionIndex(0);
      setScore(0);
      resetQuestionState();
      return;
    }

    navigateGameExit(navigate, exitPath, currentPathname);
  }, [
    currentPathname,
    embedded,
    exitPath,
    navigate,
    playItemButton,
    resetQuestionState,
    skipLanding,
    view,
  ]);

  const persistModuleCompletion = useCallback(
    async (finalScore: number, answers: Record<string, GameAnswerValue>) => {
      const timeSpentSeconds = quizStartedAtRef.current
        ? Math.round((Date.now() - quizStartedAtRef.current) / 1000)
        : undefined;

      await recordInteractiveModuleCompletion({
        config,
        score: finalScore,
        maxScore: totalQuestions,
        answers,
        timeSpentSeconds,
        tracking,
        guideId: adultGuideId,
        missionId: adultMissionId,
      });
    },
    [adultGuideId, adultMissionId, config, totalQuestions, tracking],
  );

  const computeScoreFromAnswers = useCallback(
    (finalAnswers: Record<string, GameAnswerValue>) =>
      config.questions.reduce((sum, question) => {
        const value = finalAnswers[question.id];
        if (value == null) return sum;
        const result = getGameQuestionFeedback(question, value);
        return sum + (result.correct ? 1 : 0);
      }, 0),
    [config.questions],
  );

  const finishGameSession = useCallback(
    (finalAnswers: Record<string, GameAnswerValue>) => {
      const finalScore = computeScoreFromAnswers(finalAnswers);
      const trackingMeta = tracking ?? resolveModuleTracking(config);
      const role = readActivePortalRole() ?? trackingMeta?.role ?? 'student';
      const isTraining = Boolean(adultGuideId && adultMissionId);
      const attempts = 1;

      setScore(finalScore);
      playModuleWin();
      if (isTraining) {
        markAdultTrainingMissionComplete(adultGuideId!, adultMissionId!);
        trackEvent('training_module_completed', {
          module_id: adultMissionId,
          module_title: config.landing.title,
          character: trackingMeta?.character,
          role,
        });
      }

      trackEvent('game_completed', {
        game_id: config.id,
        game_title: config.landing.title,
        character: trackingMeta?.character,
        score: finalScore,
        attempts,
        role,
      });

      void persistModuleCompletion(finalScore, finalAnswers);
      setView('complete');
      resetQuestionState();
    },
    [
      adultGuideId,
      adultMissionId,
      computeScoreFromAnswers,
      config,
      persistModuleCompletion,
      playModuleWin,
      resetQuestionState,
      tracking,
    ],
  );

  const handleStart = () => {
    playSelect();
    quizStartedAtRef.current = Date.now();
    emitGameStarted();
    setAnswersRecord({});
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
    const nextAnswers = currentQuestion
      ? { ...answersRecord, [currentQuestion.id]: answer }
      : answersRecord;

    if (questionIndex + 1 >= totalQuestions) {
      setAnswersRecord(nextAnswers);
      finishGameSession(nextAnswers);
      return;
    }

    setAnswersRecord(nextAnswers);
    setQuestionIndex((index) => index + 1);
    resetQuestionState();
  };

  const handleSkip = () => {
    playItemButton();
    const nextAnswers = currentQuestion
      ? { ...answersRecord, [currentQuestion.id]: answer }
      : answersRecord;

    if (questionIndex + 1 >= totalQuestions) {
      setAnswersRecord(nextAnswers);
      finishGameSession(nextAnswers);
      return;
    }

    setAnswersRecord(nextAnswers);
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
  const headerFlags = {
    useVictoriaHeader,
    useUncleTHeader,
    useCaidenHeader,
    useMirandaHeader,
    useCharlieHeader,
    useB4Header,
  };
  const hubBackName =
    exitLabel?.replace(/^Back to /i, '').trim() || resolveHubBackName(headerFlags);
  const showHubBackLink = exitPath !== '/' && view !== 'complete';
  const nextCase = useMirandaHeader ? getMirandaNextCase(config.id) : null;
  const nextQuest = useCaidenHeader ? getCaidenNextQuest(config.id) : null;
  const presentationStyle = config.presentationStyle ?? 'default';
  const isNotebookPresentation = presentationStyle === 'detective_notebook';
  const isTrailPresentation = presentationStyle === 'trail_notebook';

  const trackingMeta = useMemo(
    () =>
      tracking ??
      resolveModuleTracking(config, {
        guideId: adultGuideId,
        missionId: adultMissionId,
        pathname: currentPathname,
      }),
    [tracking, config, adultGuideId, adultMissionId, currentPathname],
  );

  const b4PortalType = useMemo(
    () => resolveB4PortalType(currentPathname, readActivePortalRole()),
    [currentPathname],
  );

  const usesCoachingShell = useMemo(
    () =>
      useCaidenHeader ||
      useMirandaHeader ||
      useCharlieHeader ||
      useB4Header ||
      useVictoriaHeader ||
      useUncleTHeader ||
      themeClassName.includes('b4') ||
      config.decorVariant === 'b4',
    [
      config.decorVariant,
      themeClassName,
      useB4Header,
      useCaidenHeader,
      useCharlieHeader,
      useMirandaHeader,
      useUncleTHeader,
      useVictoriaHeader,
    ],
  );

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
      case 'reflection_card':
        return 'game-quizWrap--reflectionCard';
      case 'focus_lab':
        return 'game-quizWrap--focusLab';
      case 'coaching_card':
        return 'game-quizWrap--coachingCard';
      case 'nature_card':
        return 'game-quizWrap--natureCard';
      default:
        return '';
    }
  }, [presentationStyle]);

  const shellThemeClasses = (config.shellClassName ?? themeClassName ?? '')
    .split(' ')
    .filter(Boolean);
  const embeddedShellClass =
    embedded && shellThemeClasses[0] ? `${shellThemeClasses[0]}--embedded` : '';
  const adultGuideEmbeddedClass =
    embedded && useAdultGuideHeader ? 'adult-guide-game--embedded' : '';
  const shellClass = [
    'bbc-app',
    ...shellThemeClasses,
    embeddedShellClass,
    adultGuideEmbeddedClass,
    embedded ? 'portal-gameFrame' : '',
    usesCoachingShell ? 'bbc-app--coachingShell' : '',
    view === 'quiz' ? 'bbc-app--game-active' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const interactionShellClass = usesCoachingShell ? 'shared-mission-game--coachingRail' : '';
  const HeaderComponent = useVictoriaHeader
    ? VictoriaGameHeader
    : useUncleTHeader
      ? UncleTGameHeader
      : useCharlieHeader
        ? CharlieGameHeader
        : useCaidenHeader
          ? CaidenGameHeader
          : useMirandaHeader
            ? MirandaGameHeader
            : GameHeader;

  const introHint = getMissionIntroHint({
    useVictoriaHeader,
    useUncleTHeader,
    useCaidenHeader,
    useMirandaHeader,
    useCharlieHeader,
    useB4Header,
  });
  const feedbackSpeakerLabel = getFeedbackSpeakerLabel(missionTheme);
  const playerName = readActiveChildNickname();

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
          playerName={playerName}
        />
      ) : null}

      <main
        className={[
          'bbc-main',
          view === 'landing' ? 'bbc-main--landing' : '',
          view === 'quiz' ? 'bbc-main--quiz' : '',
          showHubBackLink ? 'bbc-main--guideHubBack' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <GameInteractionShell className={interactionShellClass}>
          {showHubBackLink ? (
            <PortalBackButton
              to={exitPath}
              hubName={hubBackName}
              theme={missionTheme}
              onClick={playItemButton}
              className="game-shellBackBtn"
            />
          ) : null}

        {view === 'landing' ? (
          <div className={usesCoachingShell ? 'game-focusFlameLanding' : ''}>
            <div className={usesCoachingShell ? 'game-focusFlameLandingMain' : ''}>
              <div
                className={`bbc-landing game-landing${
                  isNotebookPresentation
                    ? ' game-landing--notebook'
                    : isTrailPresentation
                      ? ' game-landing--trailNotebook'
                      : ''
                }${usesCoachingShell ? ' game-landing--focusFlameShell' : ''}`}
              >
                <p className="bbc-eyebrow">{config.landing.eyebrow}</p>
                <h1 className="bbc-title">{config.landing.title}</h1>
                <p className="bbc-subtitle">{config.landing.subtitle}</p>
                <p className="bbc-body">{config.landing.body}</p>
                {introAvatarSrc ? (
                  useAdultGuideHeader && guideHubTheme ? (
                    <AdultMissionIntroGuide
                      avatarSrc={introAvatarSrc}
                      avatarAlt={config.avatarAlt}
                      message={introHint}
                      theme={guideHubTheme}
                    />
                  ) : (
                    <CharacterSpeechBubble
                      avatarSrc={introAvatarSrc}
                      avatarAlt={config.avatarAlt}
                      theme={missionTheme}
                      message={introHint}
                      size="large"
                      className={`mission-landingPrompt${
                        useCaidenHeader ? ' caiden-quizPrompt' : ''
                      }`}
                    />
                  )
                ) : null}
                <button type="button" className="bbc-primaryBtn game-startBtn" onClick={handleStart}>
                  {config.landing.cta}
                </button>
              </div>
            </div>
            {usesCoachingShell ? (
              <aside className="game-focusFlameLandingAside">
                <GameCoachingRailPlaceholder
                  variant={useAdultGuideHeader ? 'facilitator' : 'b4'}
                  phase="landing"
                />
              </aside>
            ) : null}
          </div>
        ) : null}

        {view === 'quiz' && currentQuestion ? (
          <SharedMissionGameLayout
            theme={missionTheme}
            avatarSrc={quizAvatarSrc}
            avatarAlt={config.avatarAlt}
            guideAvatarSrc={config.guideAvatarSrc}
            guideAvatarAlt={config.guideAvatarAlt ?? config.avatarAlt}
            speakerLabel={feedbackSpeakerLabel}
            question={currentQuestion}
            questionIndex={questionIndex}
            answer={answer}
            checked={checked}
            feedback={feedback}
            feedbackTone={feedbackTone}
            quizWrapModifier={quizWrapModifier}
            useCoachingRail={usesCoachingShell}
            useLockInFeedback={
              usesCoachingShell && !useAdultGuideHeader
            }
            useAdultLearningRhythm={useAdultGuideHeader}
            coachingRailVariant={useVictoriaHeader || useUncleTHeader ? 'facilitator' : 'b4'}
            gameId={config.id}
            b4PortalType={b4PortalType}
            tracking={trackingMeta}
            useVictoriaHeader={useVictoriaHeader}
            useUncleTHeader={useUncleTHeader}
            useCaidenHeader={useCaidenHeader}
            useMirandaHeader={useMirandaHeader}
            useCharlieHeader={useCharlieHeader}
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
        ) : null}

        {view === 'complete' ? (
          <GameAssessmentComplete
            config={config.complete}
            score={score}
            total={totalQuestions}
            onPlayAgain={handlePlayAgain}
            onExit={() => {
              playItemButton();
              navigateGameExit(navigate, exitPath, currentPathname);
            }}
            showMirandaAvatar={useMirandaHeader}
            showCaidenAvatar={useCaidenHeader}
            showVictoriaAvatar={useVictoriaHeader}
            showUncleTAvatar={useUncleTHeader}
            showCharlieAvatar={useCharlieHeader}
            avatarSrc={config.avatarSrc}
            avatarAlt={config.avatarAlt}
            hubPath={
              useMirandaHeader || useCaidenHeader || useCharlieHeader || useB4Header || useAdultGuideHeader
                ? exitPath
                : undefined
            }
            nextCasePath={nextCase?.path ?? nextQuest?.path}
            nextCaseLabel={nextCase?.label ?? nextQuest?.label}
            familyPortalPath={
              useAdultGuideHeader
                ? portalSectionPath ?? familyPortalPath
                : useCaidenHeader || useCharlieHeader || useB4Header
                  ? familyPortalPath
                  : undefined
            }
            scoreLabel={
              useVictoriaHeader
                ? 'reflections'
                : useUncleTHeader
                  ? 'coaching moments'
                  : useCaidenHeader
                    ? 'focus moments'
                    : useCharlieHeader
                      ? 'trail moments'
                      : useB4Header
                        ? 'feeling clues'
                        : 'clues'
            }
            continueLabel={
              useCaidenHeader
                ? 'Continue Journey'
                : useCharlieHeader
                  ? 'Continue Nature Nook'
                  : useB4Header
                    ? 'Continue B-4 Missions'
                    : useAdultGuideHeader
                      ? hubContinueLabel
                      : undefined
            }
            familyPortalLabel={
              useAdultGuideHeader
                ? portalSectionLabel ??
                  (familyPortalPath ? 'Return to Parent Corner' : undefined)
                : useCaidenHeader
                  ? 'Return to Family Portal'
                  : undefined
            }
            exitLabel={exitLabel}
            onNavClick={playItemButton}
          />
        ) : null}
        </GameInteractionShell>
      </main>

      {view === 'quiz' ? (
        <B4BaselineBottomBar
          canCheck={canCheck}
          checked={checked}
          feedback={feedback}
          feedbackTone={feedbackTone}
          hideInlineFeedback={usesCoachingShell}
          coachingShell={usesCoachingShell}
          onSkip={handleSkip}
          onCheck={handleCheck}
          onContinue={handleContinue}
        />
      ) : null}
    </div>
  );
}
