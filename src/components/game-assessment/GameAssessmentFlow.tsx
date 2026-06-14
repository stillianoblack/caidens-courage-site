import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuestionInteraction } from '../../hooks/useQuestionInteraction';
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
  getCorrectFeedbackMessage,
  getGameQuestionFeedback,
  getIncorrectFeedbackMessage,
  isGameAnswerComplete,
  isGameAnswerCorrect,
} from '../../lib/gameAssessmentValidation';
import { mergeAttemptIntoAnswersJson, scoreFromFirstAttempts } from '../../lib/questionAttemptTracking';
import type { QuestionAttemptsMap } from '../../types/questionInteraction';
import GameAssessmentComplete from './GameAssessmentComplete';
import CharacterSpeechBubble from './shared/CharacterSpeechBubble';
import PortalBreadcrumb from '../portal/PortalBreadcrumb';
import {
  inferCharacterFromPath,
  resolveGameplayBreadcrumb,
} from '../../lib/portalBreadcrumbNav';
import GameInteractionShell from './shared/GameInteractionShell';
import GameBackgroundDecor from './shared/GameBackgroundDecor';
import GameplayTopBar from '../../design-system/game/GameplayTopBar';
import {
  resolveGameplayTopBarFlames,
  resolveGameplayTopBarVariant,
} from '../../design-system/game/resolveGameplayTopBarConfig';
import GameHeader from './shared/GameHeader';
import AdultMissionIntroGuide from '../adult-learning/AdultMissionIntroGuide';
import '../adult-learning/adult-mission-intro.css';
import type { AdultGuideThemeId } from '../../types/adultTraining';
import GameCoachingRailPlaceholder from '../../design-system/game/GameCoachingRailPlaceholder';
import {
  buildCoachCardReadAloudSegments,
  buildGameplayReadAloudSegments,
  buildReadAloudSegmentsFromParts,
  buildReadAloudSegmentsFromGameQuestion,
  IdleSessionGuard,
  ReadAloudControl,
} from '../../design-system/narration';
import { resolveB4PortalType } from '../../design-system/game/getB4LockInTip';
import { patternClassName, resolveGameUIPattern } from '../../design-system/game/patterns/gameUIPatterns';
import SharedMissionGameLayout from '../mission-game/SharedMissionGameLayout';
import { getMissionIntroHint } from '../mission-game/missionIntroHints';
import type { MissionGameTheme } from '../mission-game/MissionSpeechRow';
import { getCaidenNextQuest } from '../../data/caiden/progression';
import { getMirandaNextCase } from '../../data/miranda/progression';
import { markAdultTrainingMissionComplete } from '../../lib/adultTrainingCompletion';
import { readActivePortalRole } from '../../config/portalContext';
import { readGameplayPlayerDisplayName } from '../../lib/gameplayPlayerIdentity';
import { resolveModuleTracking } from '../../data/moduleTrackingRegistry';
import { trackEvent } from '../../lib/analytics';
import { recordInteractiveModuleCompletion } from '../../lib/recordInteractiveCompletion';
import CourageMissionCompleteCelebration from '../courage-in-the-dark/CourageMissionCompleteCelebration';
import {
  completeWeeklyCourageMission,
  resolveWeeklyCourageMissionPayload,
} from '../../lib/courageWeeklyMissionCompletion';
import {
  navigateGameExit,
  shouldGameplayExitImmediately,
} from '../../lib/gameExitNavigation';
import { endProtectedChildSession } from '../../lib/endProtectedChildSession';
import {
  readWeeklyAdventureRouteContext,
  resolveWeeklyAdventureReturnHref,
} from '../../lib/weeklyAdventureRouteContext';
import type {
  CompleteMissionResult,
  CourageMissionRewardPayload,
} from '../../types/courageMissionProgress';
import type { ModuleTrackingDefinition } from '../../types/moduleTracking';
import '../caiden/caiden-game.css';
import '../adult/adult-game.css';
import '../adult/uncle-t-game.css';
import '../mission-game/mission-game.css';
import '../charlie/charlie-game.css';

type GameView = 'landing' | 'quiz' | 'complete' | 'courage-celebration';

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
  /** Zeke team quest header */
  useZekeHeader?: boolean;
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
  /** Extra metadata merged into module result answers (e.g. Miranda grade band) */
  completionContext?: {
    gradeBandUsed?: string;
    gradeLevelUsed?: string;
    contentVersionId?: string;
    fileId?: string;
    missionId?: string;
  };
};

function getMissionTheme(flags: {
  useVictoriaHeader: boolean;
  useUncleTHeader: boolean;
  useCaidenHeader: boolean;
  useMirandaHeader: boolean;
  useCharlieHeader: boolean;
  useB4Header: boolean;
  useZekeHeader: boolean;
}): MissionGameTheme {
  if (flags.useVictoriaHeader) return 'victoria';
  if (flags.useUncleTHeader) return 'uncle-t';
  if (flags.useCaidenHeader) return 'caiden';
  if (flags.useMirandaHeader) return 'miranda';
  if (flags.useCharlieHeader) return 'charlie';
  if (flags.useB4Header) return 'b4';
  if (flags.useZekeHeader) return 'default';
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
  useZekeHeader: boolean;
}): string {
  if (flags.useVictoriaHeader) return 'Learning Hub';
  if (flags.useUncleTHeader) return 'Coaching Hub';
  if (flags.useCaidenHeader) return 'Focus Flame Journey';
  if (flags.useMirandaHeader) return 'Mystery Files';
  if (flags.useCharlieHeader) return 'Science Lab';
  if (flags.useB4Header) return 'B-4 Missions';
  if (flags.useZekeHeader) return 'Team Quest';
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
  useZekeHeader = false,
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
  completionContext,
}: GameAssessmentFlowProps) {
  const hubContinueLabel = adultHubContinueLabel ?? victoriaHubContinueLabel;
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname: currentPathname, search: currentSearch } = location;
  const totalQuestions = config.questions.length;
  const {
    soundEnabled,
    toggleSound,
    playSelect,
    playItemButton,
    playContinue,
    playModuleWin,
    playResultFeelings,
    playMissionCompleteChime,
    playCoinTick,
    playBadgeSparkle,
  } = useBaselineCheckSounds();

  const [view, setView] = useState<GameView>(skipLanding ? 'quiz' : 'landing');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answersRecord, setAnswersRecord] = useState<Record<string, GameAnswerValue>>({});
  const [attemptsRecord, setAttemptsRecord] = useState<QuestionAttemptsMap>({});
  const [courageMissionPayload, setCourageMissionPayload] =
    useState<CourageMissionRewardPayload | null>(null);
  const [courageMissionResult, setCourageMissionResult] = useState<CompleteMissionResult | null>(
    null,
  );
  const [sessionFinishing, setSessionFinishing] = useState(false);
  const quizStartedAtRef = useRef<number | null>(null);

  const weeklyCouragePayload = useMemo(
    () => resolveWeeklyCourageMissionPayload(currentPathname, currentSearch),
    [currentPathname, currentSearch],
  );

  const currentQuestion = config.questions[questionIndex];

  const interaction = useQuestionInteraction({
    questionId: currentQuestion?.id ?? '',
    hints: currentQuestion?.hints,
    explainMore: currentQuestion?.explainMore,
    maxAttempts: 2,
    isAnswerComplete: (value) =>
      currentQuestion ? isGameAnswerComplete(currentQuestion, value) : false,
    isAnswerCorrect: (value) =>
      currentQuestion ? isGameAnswerCorrect(currentQuestion, value) : false,
    getCorrectFeedback: () =>
      currentQuestion ? getCorrectFeedbackMessage(currentQuestion) : '',
    getIncorrectFeedback: () =>
      currentQuestion
        ? getIncorrectFeedbackMessage(currentQuestion)
        : 'Not quite. Try again or use a hint.',
  });

  const {
    answer,
    checked,
    feedback,
    feedbackTone,
    canCheck,
    canContinue,
    canTryAgain,
    canUseHint,
    canExplainMore,
    showExplainMore,
    activeHint,
    selectAnswer,
    check: submitCheck,
    tryAgain,
    useHint: revealHint,
    toggleExplainMore,
    reset: resetInteraction,
    buildAttemptRecord,
    attemptsCount,
    isCorrect,
  } = interaction;

  useEffect(() => {
    resetInteraction();
  }, [questionIndex, resetInteraction]);
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
    useZekeHeader,
  });
  const guideHubTheme = getGuideHubTheme({ useVictoriaHeader, useUncleTHeader });
  const useAdultGuideHeader = useVictoriaHeader || useUncleTHeader;

  const headerFlags = useMemo(
    () => ({
      useVictoriaHeader,
      useUncleTHeader,
      useCaidenHeader,
      useMirandaHeader,
      useCharlieHeader,
      useB4Header,
      useZekeHeader,
    }),
    [
      useB4Header,
      useCaidenHeader,
      useCharlieHeader,
      useMirandaHeader,
      useUncleTHeader,
      useVictoriaHeader,
      useZekeHeader,
    ],
  );

  const gameplayCharacterId = useMemo(() => {
    if (useCaidenHeader) return 'caiden';
    if (useMirandaHeader) return 'miranda';
    if (useCharlieHeader) return 'charlie';
    if (useB4Header) return 'b4';
    if (useZekeHeader) return 'zeke';
    return inferCharacterFromPath(currentPathname);
  }, [
    currentPathname,
    useB4Header,
    useCaidenHeader,
    useCharlieHeader,
    useMirandaHeader,
    useZekeHeader,
  ]);

  const gameplayBreadcrumb = useMemo(
    () =>
      resolveGameplayBreadcrumb({
        pathname: currentPathname,
        search: currentSearch,
        state: location.state,
        characterId: gameplayCharacterId,
        fallbackExitPath: exitPath,
        fallbackExitLabel:
          exitLabel ??
          `Back to ${resolveHubBackName(headerFlags)}`,
      }),
    [
      currentPathname,
      currentSearch,
      location.state,
      gameplayCharacterId,
      exitPath,
      exitLabel,
      headerFlags,
    ],
  );

  const resolvedExitPath = gameplayBreadcrumb.href;

  useSetMissionGamePhase(view === 'courage-celebration' ? 'complete' : view);

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
    resetInteraction();
  }, [resetInteraction]);

  const handleIdleEndSession = useCallback(() => {
    endProtectedChildSession(navigate, currentPathname);
  }, [currentPathname, navigate]);

  const handleExit = useCallback(() => {
    playItemButton();
    const exitImmediately = shouldGameplayExitImmediately(embedded, skipLanding);

    if (exitImmediately || view === 'complete') {
      navigateGameExit(navigate, resolvedExitPath, currentPathname);
      return;
    }

    if (view === 'quiz') {
      setView('landing');
      setQuestionIndex(0);
      setScore(0);
      resetQuestionState();
      return;
    }

    navigateGameExit(navigate, resolvedExitPath, currentPathname);
  }, [
    currentPathname,
    embedded,
    navigate,
    playItemButton,
    resetQuestionState,
    resolvedExitPath,
    skipLanding,
    view,
  ]);

  const persistModuleCompletion = useCallback(
    async (
      finalScore: number,
      answers: Record<string, GameAnswerValue> | ReturnType<typeof mergeAttemptIntoAnswersJson>,
    ) => {
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
        missionId: adultMissionId ?? completionContext?.missionId,
        gradeBandUsed: completionContext?.gradeBandUsed,
        gradeLevelUsed: completionContext?.gradeLevelUsed,
        contentVersionId: completionContext?.contentVersionId,
        fileId: completionContext?.fileId,
      });
    },
    [adultGuideId, adultMissionId, completionContext, config, totalQuestions, tracking],
  );

  const computeScoreFromAnswers = useCallback(
    (finalAnswers: Record<string, GameAnswerValue>, attempts?: QuestionAttemptsMap) => {
      if (attempts && Object.keys(attempts).length > 0) {
        return scoreFromFirstAttempts(attempts);
      }
      return config.questions.reduce((sum, question) => {
        const value = finalAnswers[question.id];
        if (value == null) return sum;
        const result = getGameQuestionFeedback(question, value);
        return sum + (result.correct ? 1 : 0);
      }, 0);
    },
    [config.questions],
  );

  const handleReturnToAdventureMap = useCallback(() => {
    playItemButton();
    const context = readWeeklyAdventureRouteContext(currentSearch);
    const week = context.week && context.week > 0 ? context.week : 1;
    navigate(resolveWeeklyAdventureReturnHref(currentPathname, week));
  }, [currentPathname, currentSearch, navigate, playItemButton]);

  const finishGameSession = useCallback(
    (finalAnswers: Record<string, GameAnswerValue>, questionAttempts: QuestionAttemptsMap) => {
      const finalScore = computeScoreFromAnswers(finalAnswers, questionAttempts);
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

      const mergedAnswers = mergeAttemptIntoAnswersJson(finalAnswers, questionAttempts);

      if (weeklyCouragePayload) {
        void (async () => {
          const [result] = await Promise.all([
            completeWeeklyCourageMission(currentPathname, currentSearch),
            persistModuleCompletion(finalScore, mergedAnswers),
          ]);
          setCourageMissionPayload(weeklyCouragePayload);
          setCourageMissionResult(
            result ?? {
              ok: false,
              error: 'save_failed',
              message: 'Progress could not save. Please try again.',
            },
          );
          setSessionFinishing(false);
          setView('courage-celebration');
          resetQuestionState();
        })();
        return;
      }

      void persistModuleCompletion(finalScore, mergedAnswers);
      setSessionFinishing(false);
      setView('complete');
      resetQuestionState();
    },
    [
      adultGuideId,
      adultMissionId,
      computeScoreFromAnswers,
      config,
      currentPathname,
      currentSearch,
      persistModuleCompletion,
      playModuleWin,
      resetQuestionState,
      tracking,
      weeklyCouragePayload,
    ],
  );

  const handleStart = () => {
    playSelect();
    quizStartedAtRef.current = Date.now();
    emitGameStarted();
    setAnswersRecord({});
    setAttemptsRecord({});
    setView('quiz');
    setQuestionIndex(0);
    setScore(0);
    resetQuestionState();
  };

  const handleCheck = () => {
    if (!currentQuestion || !canCheck) return;

    playSelect();
    const wasFirstAttempt = attemptsCount === 0;
    const correct = isGameAnswerCorrect(currentQuestion, answer);
    submitCheck();
    if (correct && wasFirstAttempt) {
      setScore((prev) => prev + 1);
      playResultFeelings();
    }
  };

  const handleContinue = () => {
    if (!currentQuestion || !canContinue || sessionFinishing) return;

    playContinue();
    const attempt = buildAttemptRecord();
    const nextAttempts = { ...attemptsRecord, [currentQuestion.id]: attempt };
    const nextAnswers = { ...answersRecord, [currentQuestion.id]: answer };

    if (questionIndex + 1 >= totalQuestions) {
      setSessionFinishing(true);
      setAnswersRecord(nextAnswers);
      setAttemptsRecord(nextAttempts);
      finishGameSession(nextAnswers, nextAttempts);
      return;
    }

    setAnswersRecord(nextAnswers);
    setAttemptsRecord(nextAttempts);
    setQuestionIndex((index) => index + 1);
  };

  const handleSkip = () => {
    playItemButton();
    const nextAnswers = currentQuestion
      ? { ...answersRecord, [currentQuestion.id]: answer }
      : answersRecord;
    const nextAttempts = attemptsRecord;

    if (questionIndex + 1 >= totalQuestions) {
      setAnswersRecord(nextAnswers);
      finishGameSession(nextAnswers, nextAttempts);
      return;
    }

    setAnswersRecord(nextAnswers);
    setQuestionIndex((index) => index + 1);
  };

  const handleTryAgain = () => {
    playSelect();
    tryAgain();
  };

  const handleUseHint = () => {
    playSelect();
    revealHint();
  };

  const handlePlayAgain = () => {
    playItemButton();
    setView('landing');
    setQuestionIndex(0);
    setScore(0);
    resetQuestionState();
  };

  const showTopBar = view !== 'landing';
  const revealCorrectAnswer = checked && (isCorrect || attemptsCount >= 2);
  const hubBackLabel = gameplayBreadcrumb.label;
  const hubBackHref = gameplayBreadcrumb.href;
  const showHubBackLink =
    exitPath !== '/' && view !== 'complete' && view !== 'courage-celebration';
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
      useZekeHeader ||
      useVictoriaHeader ||
      useUncleTHeader ||
      themeClassName.includes('b4') ||
      themeClassName.includes('zeke') ||
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
      useZekeHeader,
    ],
  );

  const topBarVariant = resolveGameplayTopBarVariant(missionTheme, headerFlags);
  const topBarFlames = resolveGameplayTopBarFlames(topBarVariant, headerFlags);

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
  const gamePattern = useMemo(
    () =>
      resolveGameUIPattern({
        theme: missionTheme,
        useCaidenHeader,
        useMirandaHeader,
        useCharlieHeader,
        useB4Header,
        useVictoriaHeader,
        useUncleTHeader,
      }),
    [
      missionTheme,
      useB4Header,
      useCaidenHeader,
      useCharlieHeader,
      useMirandaHeader,
      useUncleTHeader,
      useVictoriaHeader,
    ],
  );

  const shellClass = [
    'bbc-app',
    ...shellThemeClasses,
    embeddedShellClass,
    adultGuideEmbeddedClass,
    embedded ? 'portal-gameFrame' : '',
    usesCoachingShell ? 'bbc-app--coachingShell' : '',
    view === 'quiz' ? 'bbc-app--game-active' : '',
    patternClassName(gamePattern.id),
  ]
    .filter(Boolean)
    .join(' ');
  const interactionShellClass = usesCoachingShell ? 'shared-mission-game--coachingRail' : '';

  const introHint = getMissionIntroHint({
    useVictoriaHeader,
    useUncleTHeader,
    useCaidenHeader,
    useMirandaHeader,
    useCharlieHeader,
    useB4Header,
  });
  const landingGuideCharacter = useUncleTHeader
    ? 'uncle-t'
    : useVictoriaHeader
      ? 'dr-victoria'
      : 'b4';

  const landingReadAloudSegments = useMemo(() => {
    const missionIntro = buildReadAloudSegmentsFromParts({
      scenarioTitle: config.landing.title,
      scenarioDescription: [config.landing.subtitle, config.landing.body, introHint]
        .filter(Boolean)
        .join(' '),
    });
    const coachIntro = buildCoachCardReadAloudSegments({
      state: 'placeholder',
      guideCharacter: landingGuideCharacter,
      phase: 'landing',
    });
    return buildGameplayReadAloudSegments(missionIntro, coachIntro);
  }, [
    config.landing.body,
    config.landing.subtitle,
    config.landing.title,
    introHint,
    landingGuideCharacter,
  ]);
  const feedbackSpeakerLabel = getFeedbackSpeakerLabel(missionTheme);
  const playerName = readGameplayPlayerDisplayName();

  const topBarReadAloudSegments = useMemo(() => {
    if (view !== 'quiz' || !currentQuestion) return [];
    return buildReadAloudSegmentsFromGameQuestion(currentQuestion);
  }, [currentQuestion, view]);

  const topBarReadAloudKey = currentQuestion
    ? `${config.id}::${currentQuestion.id}::${questionIndex}`
    : config.id;

  return (
    <div className={shellClass}>
      <GameBackgroundDecor variant={decorVariant} />

      {showTopBar ? (
        usesCoachingShell ? (
          <GameplayTopBar
            variant={topBarVariant}
            backLabel={showHubBackLink ? hubBackLabel : undefined}
            backHref={showHubBackLink ? hubBackHref : undefined}
            onBackClick={playItemButton}
            onBack={
              !showHubBackLink && view !== 'courage-celebration' ? handleExit : undefined
            }
            progressPercent={progressPct}
            showProgress={view === 'quiz' || view === 'complete' || view === 'courage-celebration'}
            playerName={playerName}
            showFlameStatus={!useAdultGuideHeader}
            flameDisplay={topBarFlames.flameDisplay}
            flamesLit={topBarFlames.flamesLit}
            readAloudSegments={topBarReadAloudSegments}
            readAloudResetKey={topBarReadAloudKey}
            readAloudAriaLabel="Read this question aloud"
          />
        ) : (
          <GameHeader
            progressPct={progressPct}
            onExit={handleExit}
            showProgress={view === 'quiz' || view === 'complete' || view === 'courage-celebration'}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            playerName={playerName}
          />
        )
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
          {showHubBackLink && !usesCoachingShell ? (
            <PortalBreadcrumb
              label={hubBackLabel}
              href={hubBackHref}
              theme={missionTheme}
              onClick={playItemButton}
              variant="game"
              className="game-shellBackBtn"
            />
          ) : null}

        {view === 'landing' ? (
          /* TODO: deprecated intro screen — family portal missions use skipLanding to bypass */
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
                  guideCharacter={
                    useUncleTHeader ? 'uncle-t' : useVictoriaHeader ? 'dr-victoria' : 'b4'
                  }
                  phase="landing"
                />
                <ReadAloudControl segments={landingReadAloudSegments} resetKey={`landing-${config.id}`} />
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
            patternId={gamePattern.id}
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
            useZekeHeader={useZekeHeader}
            useB4Header={useB4Header}
            revealCorrectAnswer={revealCorrectAnswer}
            activeHint={activeHint}
            canTryAgain={canTryAgain}
            canUseHint={canUseHint}
            canExplainMore={canExplainMore}
            showExplainMore={showExplainMore}
            onContinue={handleContinue}
            continueBusy={sessionFinishing}
            onTryAgain={handleTryAgain}
            onUseHint={handleUseHint}
            onToggleExplainMore={toggleExplainMore}
            onPlaySelect={playSelect}
            onSelectChoice={(id) => selectAnswer(id)}
            onSelectTrueFalse={(value) => selectAnswer(value)}
            onSequenceTap={(id) => {
              const order = Array.isArray(answer) ? [...answer] : [];
              if (order.includes(id)) return;
              selectAnswer([...order, id]);
            }}
            onSequenceClear={() => selectAnswer([])}
          />
        ) : null}

        {view === 'courage-celebration' && courageMissionPayload && courageMissionResult ? (
          <CourageMissionCompleteCelebration
            payload={courageMissionPayload}
            result={courageMissionResult}
            onReturnToMap={handleReturnToAdventureMap}
            sounds={{
              playMissionComplete: playMissionCompleteChime,
              playCoinTick,
              playBadgeSparkle,
            }}
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
                  ? 'Continue Science Lab'
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
          canTryAgain={canTryAgain}
          canUseHint={canUseHint}
          canExplainMore={canExplainMore}
          showExplainMore={showExplainMore}
          explainMore={currentQuestion?.explainMore}
          activeHint={activeHint}
          attachContinueToFeedback={false}
          onSkip={handleSkip}
          onCheck={handleCheck}
          onContinue={handleContinue}
          onTryAgain={handleTryAgain}
          onUseHint={handleUseHint}
          onToggleExplainMore={toggleExplainMore}
        />
      ) : null}

      <IdleSessionGuard
        enabled={view === 'quiz' || view === 'landing'}
        onEndSession={handleIdleEndSession}
      />
    </div>
  );
}
