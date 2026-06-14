import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { readActivePilotProgram, resolveActiveProgramContext } from '../../config/activePilotProgram';
import { resolveTrackingProgramCode } from '../../lib/activeProgramContext';
import { readActiveChildParticipantId } from '../../config/activeChildParticipant';
import { readGameplayPlayerDisplayName } from '../../lib/gameplayPlayerIdentity';
import { ACTIVE_CHILD_EVENT } from '../../lib/activeChildContext';
import { getB4CheckInStatus, type B4CheckInDisplayStatus } from '../../lib/b4CheckInStatus';
import { CHILD_BASELINE_ASSESSMENT_TYPE } from '../../config/assessmentTypeConstants';
import { ensureParticipantForBaseline } from '../../lib/childProfileService';
import { readParticipantGradeSettingsAsync } from '../../lib/mirandaGradeBandResolver';
import { hasCanonicalGradeLevel } from '../../lib/participantGradeDisplay';
import { useSetMissionGamePhase, type MissionGamePhase } from '../../context/MissionGamePhaseContext';
import B4BaselineBottomBar from '../b4-baseline-check/B4BaselineBottomBar';
import B4BaselineHub from '../b4-baseline-check/B4BaselineHub';
import B4BaselineResults from '../b4-baseline-check/B4BaselineResults';
import B4BaselineStudentForm from '../b4-baseline-check/B4BaselineStudentForm';
import B4BaselineGradeGate from '../b4-baseline-check/B4BaselineGradeGate';
import B4BaselineTopBar, { B4Avatar } from '../b4-baseline-check/B4BaselineTopBar';
import '../b4-baseline-check/b4-baseline-check.css';
import GameInteractionShell from '../game-assessment/shared/GameInteractionShell';
import GameplayTopBar from '../../design-system/game/GameplayTopBar';
import GameplayShell from '../../design-system/game/GameplayShell';
import CoachingShellQuizFrame from '../../design-system/game/CoachingShellQuizFrame';
import ScenarioCard from '../../design-system/game/ScenarioCard';
import AssessmentCoachRail from '../../design-system/game/AssessmentCoachRail';
import {
  buildAssessmentCoachRailSegments,
  buildGameplayReadAloudSegments,
  buildReadAloudSegmentsFromParts,
} from '../../design-system/narration';
import { resolveGameplayTopBarFlames } from '../../design-system/game/resolveGameplayTopBarConfig';
import '../../design-system/game/gameDesignStyles';
import {
  B4_BASELINE_FEELINGS_FEEDBACK,
  B4_BASELINE_FEELINGS_QUESTIONS,
  B4_BASELINE_FAMILY_LANDING,
  B4_BASELINE_FOCUS_MOVES_QUESTIONS,
  B4_BASELINE_LANDING,
  B4_BASELINE_MODULE_COMPLETE,
  B4_BASELINE_READING_PASSAGE,
  B4_BASELINE_READING_QUESTIONS,
  B4_BASELINE_SCALE,
  getBaselineModuleQuestionCount,
  getNextBaselineModule,
  scoreBaselineFeelings,
  scoreBaselineMc,
  type BaselineMcQuestion,
  type BaselineModuleId,
} from '../../data/b4BaselineCheckContent';
import {
  isBaselineFullyComplete,
  loadB4BaselineState,
  markBaselineModuleComplete,
  resetB4BaselineSession,
  saveB4BaselineStudentProfile,
  submitBaselineResults,
} from '../../lib/b4BaselineCheckStorage';
import { useBaselineCheckSounds } from '../../hooks/useBaselineCheckSounds';
import { refreshAnalyticsIdentity, trackEvent } from '../../lib/analytics';
import { B4_AVATAR_SRC } from '../../data/b4/avatar';
import B4BaselineFamilyEntry from '../b4-baseline-check/B4BaselineFamilyEntry';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import { familyPortalPath, familySettingsTabPath } from '../../lib/familyPortalPaths';
import B4CheckInStepGraphic from './B4CheckInStepGraphic';
import type { QuestionAttemptsMap } from '../../types/questionInteraction';
import CourageMissionCompleteCelebration from '../courage-in-the-dark/CourageMissionCompleteCelebration';
import {
  completeWeeklyCourageMission,
  resolveWeeklyCourageMissionPayload,
} from '../../lib/courageWeeklyMissionCompletion';
import { readWeeklyAdventureRouteContext,
  resolveWeeklyAdventureReturnHref,
} from '../../lib/weeklyAdventureRouteContext';
import { endProtectedChildSession } from '../../lib/endProtectedChildSession';
import type {
  CompleteMissionResult,
  CourageMissionRewardPayload,
} from '../../types/courageMissionProgress';

type View =
  | 'landing'
  | 'grade_gate'
  | 'hub'
  | 'quiz'
  | 'module-complete'
  | 'final'
  | 'courage-celebration';

type B4BaselineCheckFlowProps = {
  embedded?: boolean;
  familyPortal?: boolean;
  onExit?: () => void;
};

export default function B4BaselineCheckFlow({
  embedded = false,
  familyPortal = false,
  onExit,
}: B4BaselineCheckFlowProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    soundEnabled,
    toggleSound,
    playSelect,
    playItemButton,
    playContinue,
    playModuleWin,
    playResultFeelings,
    playResultReading,
    playResultFocus,
    playMissionCompleteChime,
    playCoinTick,
    playBadgeSparkle,
  } = useBaselineCheckSounds();

  const activeParticipantId = readActiveChildParticipantId();
  const {
    roster,
    participantId: contextParticipantId,
    displayName: contextDisplayName,
    hasActiveParticipant,
    needsSelection,
    selectParticipant,
    loading: participantLoading,
  } = useActiveParticipant();
  const [familyCheckInStatus, setFamilyCheckInStatus] = useState<B4CheckInDisplayStatus>('Not Started');
  const [hubState, setHubState] = useState(() => loadB4BaselineState(activeParticipantId));
  const [view, setView] = useState<View>('landing');
  const [playerName, setPlayerName] = useState(
    () =>
      readGameplayPlayerDisplayName() ||
      loadB4BaselineState(activeParticipantId).profile?.nickname ||
      '',
  );
  const [courageMissionPayload, setCourageMissionPayload] =
    useState<CourageMissionRewardPayload | null>(null);
  const [courageMissionResult, setCourageMissionResult] = useState<CompleteMissionResult | null>(
    null,
  );

  const missionPhase: MissionGamePhase = useMemo(() => {
    if (view === 'quiz') return 'quiz';
    if (view === 'module-complete' || view === 'final' || view === 'courage-celebration') {
      return 'complete';
    }
    if (view === 'landing' || view === 'hub' || view === 'grade_gate') return 'landing';
    return 'off';
  }, [view]);
  useSetMissionGamePhase(missionPhase);
  const [activeModule, setActiveModule] = useState<BaselineModuleId | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feelingsAnswers, setFeelingsAnswers] = useState<Record<string, number>>({});
  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | number | null>(null);
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'try' | 'neutral'>('neutral');
  const [mcAttempts, setMcAttempts] = useState(0);
  const [mcHintsUsed, setMcHintsUsed] = useState(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [mcAttemptsRecord, setMcAttemptsRecord] = useState<QuestionAttemptsMap>({});
  const mcFirstAnswerRef = useRef<Record<string, string>>({});
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [gradeGateParticipantId, setGradeGateParticipantId] = useState<string | null>(null);
  const [pendingBaselineStart, setPendingBaselineStart] = useState<{
    participant: { participantId: string; firstName: string; nickname: string };
    values: { programCode: string; groupName: string };
  } | null>(null);
  const landingCopy = familyPortal ? B4_BASELINE_FAMILY_LANDING : B4_BASELINE_LANDING;
  const programContext = resolveActiveProgramContext();
  const childrenSettingsPath = familySettingsTabPath('children', location.pathname);
  const continueLearningPath = familyPortalPath('continue-learning', location.pathname);
  const resolvedParticipantId = contextParticipantId || activeParticipantId;
  const resolvedChildName = useMemo(() => {
    if (contextDisplayName?.trim()) return contextDisplayName.trim();
    const rosterMatch = roster.find((entry) => entry.participantId === resolvedParticipantId);
    if (rosterMatch?.displayName?.trim()) return rosterMatch.displayName.trim();
    return (
      readGameplayPlayerDisplayName() ||
      hubState.profile?.nickname ||
      ''
    );
  }, [contextDisplayName, hubState.profile?.nickname, resolvedParticipantId, roster]);
  const familyRoster = roster.map((entry) => ({
    participantId: entry.participantId,
    displayName: entry.displayName,
  }));
  const familyNeedsChildSelection = familyPortal && roster.length > 1 && (needsSelection || !hasActiveParticipant);
  const familyNoChildren = familyPortal && !participantLoading && roster.length === 0;

  const refreshHub = useCallback(() => {
    const participantId = readActiveChildParticipantId();
    setHubState(loadB4BaselineState(participantId));
    setPlayerName(
      readGameplayPlayerDisplayName() || loadB4BaselineState(participantId).profile?.nickname || '',
    );
  }, []);

  useEffect(() => {
    const onActiveChild = () => {
      refreshHub();
      setView('landing');
    };
    window.addEventListener(ACTIVE_CHILD_EVENT, onActiveChild);
    return () => window.removeEventListener(ACTIVE_CHILD_EVENT, onActiveChild);
  }, [refreshHub]);

  useEffect(() => {
    if (!familyPortal) return;
    void (async () => {
      const participantId = readActiveChildParticipantId();
      if (!participantId) {
        setFamilyCheckInStatus('Not Started');
        setView('landing');
        return;
      }

      const programCode = resolveTrackingProgramCode() ?? undefined;
      const rosterMatch = roster.find((entry) => entry.participantId === participantId);
      const statusResult = await getB4CheckInStatus({
        programCode,
        participantId,
        selectedChildName: rosterMatch?.displayName ?? resolvedChildName,
      });
      setFamilyCheckInStatus(statusResult.displayStatus);

      const scoped = loadB4BaselineState(participantId);
      if (statusResult.status === 'complete') {
        setHubState(scoped);
        setView('landing');
        return;
      }

      const displayName =
        resolvedChildName ||
        rosterMatch?.displayName ||
        readGameplayPlayerDisplayName() ||
        scoped.profile?.nickname ||
        '';
      if (!displayName) {
        setView('landing');
        return;
      }

      const gradeSettings = await readParticipantGradeSettingsAsync(participantId);
      if (!hasCanonicalGradeLevel(gradeSettings.gradeLevel)) {
        setView('landing');
        return;
      }

      if (statusResult.status === 'in_progress') {
        if (scoped.profile?.participantId === participantId) {
          setHubState(scoped);
        } else {
          const activeProgram = readActivePilotProgram();
          const next = saveB4BaselineStudentProfile({
            firstName: displayName,
            nickname: displayName,
            participantId,
            programCode: programCode || activeProgram?.programCode || scoped.profile?.programCode || '',
            groupName: activeProgram?.groupName || scoped.profile?.groupName || '',
          });
          setHubState(next);
        }
        setView('hub');
      }
    })();
  }, [activeParticipantId, contextParticipantId, familyPortal, resolvedChildName, roster]);

  const handleRevealScore = useCallback(
    (index: 0 | 1 | 2) => {
      if (index === 0) playResultFeelings();
      else if (index === 1) playResultReading();
      else playResultFocus();
    },
    [playResultFeelings, playResultReading, playResultFocus],
  );

  const totalQuestions = activeModule ? getBaselineModuleQuestionCount(activeModule) : 0;
  const progressPct =
    view === 'quiz' && totalQuestions > 0
      ? Math.round(((questionIndex + (checked ? 1 : 0)) / totalQuestions) * 100)
      : view === 'hub'
        ? Math.round((hubState.completedModules.length / 3) * 100)
        : 0;

  const currentMc: BaselineMcQuestion | null = useMemo(() => {
    if (activeModule === 'reading') return B4_BASELINE_READING_QUESTIONS[questionIndex] ?? null;
    if (activeModule === 'focus-moves') return B4_BASELINE_FOCUS_MOVES_QUESTIONS[questionIndex] ?? null;
    return null;
  }, [activeModule, questionIndex]);

  const resetQuiz = () => {
    setQuestionIndex(0);
    setFeelingsAnswers({});
    setMcAnswers({});
    setSelected(null);
    setChecked(false);
    setFeedback(null);
    setFeedbackTone('neutral');
    setMcAttempts(0);
    setMcHintsUsed(0);
    setActiveHint(null);
    setMcAttemptsRecord({});
    mcFirstAnswerRef.current = {};
  };

  const mcMaxAttempts = 2;
  const canMcTryAgain = Boolean(
    currentMc && checked && selected !== currentMc.correctId && mcAttempts < mcMaxAttempts,
  );
  const canMcUseHint = Boolean(
    currentMc && currentMc.hints?.length && mcHintsUsed < (currentMc.hints?.length ?? 0),
  );
  const canMcContinue = Boolean(
    checked &&
      (activeModule === 'feelings' ||
        selected === currentMc?.correctId ||
        mcAttempts >= mcMaxAttempts),
  );

  const goLanding = () => {
    playItemButton();
    setView('landing');
    setActiveModule(null);
    resetQuiz();
  };

  const goHub = () => {
    playItemButton();
    setView('hub');
    setActiveModule(null);
    resetQuiz();
    refreshHub();
  };

  const finishBaselineProfileStart = (
    participant: { participantId: string; firstName: string; nickname: string },
    values: { programCode: string; groupName: string },
  ) => {
    const resolvedProgramCode = resolveTrackingProgramCode('baseline_student_profile');
    const activeProgram = readActivePilotProgram();

    const next = saveB4BaselineStudentProfile({
      firstName: participant.firstName,
      nickname: participant.nickname,
      participantId: participant.participantId,
      programCode: resolvedProgramCode || activeProgram?.programCode || values.programCode,
      groupName: activeProgram?.groupName || values.groupName,
    });
    setHubState(next);
    refreshAnalyticsIdentity();
    trackEvent('student_assessment_started', {
      role: 'student',
      assessment_type: CHILD_BASELINE_ASSESSMENT_TYPE,
      participant_id: participant.participantId,
    });
    setView('hub');
  };

  const handleFamilySelectChild = useCallback(
    (participantId: string) => {
      const match = roster.find((entry) => entry.participantId === participantId);
      if (match) {
        selectParticipant(match);
      }
    },
    [roster, selectParticipant],
  );

  const handleStartFamilyCheckIn = useCallback(async () => {
    playSelect();
    setProfileError(null);
    setProfileSubmitting(true);

    try {
      const participantId = readActiveChildParticipantId();
      const rosterMatch = roster.find((entry) => entry.participantId === participantId);
      const displayName =
        resolvedChildName ||
        rosterMatch?.displayName ||
        readGameplayPlayerDisplayName() ||
        '';

      if (!participantId || !displayName) {
        setProfileError('Select your child before starting the B-4 Check-In.');
        return;
      }

      const programCode = resolveTrackingProgramCode() ?? undefined;
      const statusResult = await getB4CheckInStatus({
        programCode,
        participantId,
        selectedChildName: displayName,
      });
      setFamilyCheckInStatus(statusResult.displayStatus);

      if (statusResult.status === 'complete') {
        setHubState(loadB4BaselineState(participantId));
        setView('hub');
        return;
      }

      const gradeSettings = await readParticipantGradeSettingsAsync(participantId);
      if (!hasCanonicalGradeLevel(gradeSettings.gradeLevel)) {
        setPendingBaselineStart({
          participant: { participantId, firstName: displayName, nickname: displayName },
          values: {
            programCode: programContext?.programCode ?? hubState.profile?.programCode ?? '',
            groupName: programContext?.groupName ?? hubState.profile?.groupName ?? '',
          },
        });
        setGradeGateParticipantId(participantId);
        setView('grade_gate');
        return;
      }

      finishBaselineProfileStart(
        { participantId, firstName: displayName, nickname: displayName },
        {
          programCode: programContext?.programCode ?? hubState.profile?.programCode ?? '',
          groupName: programContext?.groupName ?? hubState.profile?.groupName ?? '',
        },
      );
    } catch {
      setProfileError('Could not start B-4 Check-In. Please try again.');
    } finally {
      setProfileSubmitting(false);
    }
  }, [
    finishBaselineProfileStart,
    hubState.profile?.groupName,
    hubState.profile?.programCode,
    playSelect,
    programContext?.groupName,
    programContext?.programCode,
    resolvedChildName,
    roster,
  ]);

  const handleStudentSubmit = async (values: {
    firstName?: string;
    nickname: string;
    programCode: string;
    groupName: string;
  }) => {
    playSelect();
    setProfileError(null);
    setProfileSubmitting(true);

    const nickname = values.nickname.trim();
    const firstName = values.firstName?.trim() || nickname;

    try {
      const participant = await ensureParticipantForBaseline({
        firstName,
        nickname,
        participantId: readActiveChildParticipantId() || hubState.profile?.participantId,
        groupName: readActivePilotProgram()?.groupName || values.groupName,
      });

      const gradeSettings = await readParticipantGradeSettingsAsync(participant.participantId);
      if (!hasCanonicalGradeLevel(gradeSettings.gradeLevel)) {
        setPendingBaselineStart({ participant, values });
        setGradeGateParticipantId(participant.participantId);
        setView('grade_gate');
        return;
      }

      finishBaselineProfileStart(participant, values);
    } catch {
      setProfileError('Could not start B-4 Check-In. Please try again.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleRetake = () => {
    playItemButton();
    resetB4BaselineSession(readActiveChildParticipantId());
    refreshHub();
    setView('hub');
    setActiveModule(null);
    resetQuiz();
  };

  const openModule = (moduleId: BaselineModuleId) => {
    playSelect();
    setActiveModule(moduleId);
    resetQuiz();
    setView('quiz');
  };

  const finishModule = async (overrides?: {
    feelings?: Record<string, number>;
    mc?: Record<string, string>;
  }) => {
    if (!activeModule) return;

    const existing = loadB4BaselineState(readActiveChildParticipantId());
    const scores = {
      feelingsScore: existing.record?.feelingsScore ?? 0,
      readingScore: existing.record?.readingScore ?? 0,
      focusMovesScore: existing.record?.focusMovesScore ?? 0,
    };

    if (activeModule === 'feelings') {
      scores.feelingsScore = scoreBaselineFeelings(overrides?.feelings ?? feelingsAnswers);
    } else if (activeModule === 'reading') {
      scores.readingScore = scoreBaselineMc(B4_BASELINE_READING_QUESTIONS, overrides?.mc ?? mcAnswers);
    } else {
      scores.focusMovesScore = scoreBaselineMc(
        B4_BASELINE_FOCUS_MOVES_QUESTIONS,
        overrides?.mc ?? mcAnswers,
      );
    }

    const participantId = readActiveChildParticipantId();
    const next = markBaselineModuleComplete(activeModule, scores, participantId);
    setHubState(next);
    playModuleWin();

    if (activeModule === 'feelings') {
      const weeklyPayload = resolveWeeklyCourageMissionPayload(
        location.pathname,
        location.search,
      );
      if (weeklyPayload) {
        const result = await completeWeeklyCourageMission(location.pathname, location.search);
        setCourageMissionPayload(weeklyPayload);
        setCourageMissionResult(
          result ?? {
            ok: false,
            error: 'save_failed',
            message: 'Progress could not save. Please try again.',
          },
        );
        setView('courage-celebration');
        return;
      }
    }

    if (isBaselineFullyComplete(next, participantId) && next.record) {
      const submitResult = await submitBaselineResults({
        ...next.record,
        mcAnswers: overrides?.mc ?? mcAnswers,
        questionAttempts: mcAttemptsRecord,
      });
      const record = next.record;
      const maxScore = (['feelings', 'reading', 'focus-moves'] as BaselineModuleId[]).reduce(
        (sum, moduleId) => sum + getBaselineModuleQuestionCount(moduleId),
        0,
      );
      const totalScore = record.feelingsScore + record.readingScore + record.focusMovesScore;
      trackEvent('student_assessment_completed', {
        role: 'student',
        assessment_type: CHILD_BASELINE_ASSESSMENT_TYPE,
        participant_id: record.participantId,
        score: totalScore,
        max_score: maxScore,
        percent_score: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
        understanding_score: record.readingScore,
        support_score: record.focusMovesScore,
      });
      setSyncMessage(submitResult.message);
      setView('final');
      return;
    }

    const nextModule = getNextBaselineModule(next.completedModules);
    if (nextModule) {
      setActiveModule(nextModule);
      resetQuiz();
      setView('quiz');
      return;
    }

    setView('module-complete');
  };

  const handleCheck = () => {
    if (selected == null) return;
    playSelect();
    setChecked(true);

    if (activeModule === 'feelings') {
      setFeedback(B4_BASELINE_FEELINGS_FEEDBACK);
      setFeedbackTone('success');
      return;
    }

    if (currentMc) {
      const nextAttempts = mcAttempts + 1;
      setMcAttempts(nextAttempts);
      const correct = selected === currentMc.correctId;
      if (correct) {
        setFeedback(currentMc.correctFeedback ?? 'Nice! You got it.');
        setFeedbackTone('success');
      } else {
        setFeedback(
          currentMc.incorrectFeedback ?? 'Not quite. Try again or use a hint.',
        );
        setFeedbackTone('try');
      }
    }
  };

  const handleMcTryAgain = () => {
    if (!canMcTryAgain) return;
    playSelect();
    setChecked(false);
    setFeedback(null);
    setFeedbackTone('neutral');
    setSelected(null);
  };

  const handleMcUseHint = () => {
    if (!currentMc?.hints?.length || mcHintsUsed >= currentMc.hints.length) return;
    playSelect();
    setActiveHint(currentMc.hints[mcHintsUsed]);
    setMcHintsUsed((count) => count + 1);
  };

  const advanceQuestion = (overrides?: {
    feelings?: Record<string, number>;
    mc?: Record<string, string>;
  }) => {
    playContinue();
    setSelected(null);
    setChecked(false);
    setFeedback(null);
    setFeedbackTone('neutral');
    setMcAttempts(0);
    setMcHintsUsed(0);
    setActiveHint(null);

    if (activeModule === 'feelings') {
      const q = B4_BASELINE_FEELINGS_QUESTIONS[questionIndex];
      const nextFeelings = overrides?.feelings ?? {
        ...feelingsAnswers,
        ...(selected != null ? { [q.id]: selected as number } : {}),
      };
      setFeelingsAnswers(nextFeelings);

      if (questionIndex + 1 >= B4_BASELINE_FEELINGS_QUESTIONS.length) {
        finishModule({ feelings: nextFeelings });
        return;
      }
      setQuestionIndex((i) => i + 1);
      return;
    }

    if (currentMc) {
      const finalAnswer = String(selected);
      const nextMc = overrides?.mc ?? {
        ...mcAnswers,
        ...(selected != null ? { [currentMc.id]: finalAnswer } : mcAnswers),
      };
      if (selected != null) {
        if (!mcFirstAnswerRef.current[currentMc.id]) {
          mcFirstAnswerRef.current[currentMc.id] = finalAnswer;
        }
        const firstAnswer = mcFirstAnswerRef.current[currentMc.id];
        const isCorrectFirst = firstAnswer === currentMc.correctId;
        const isCorrectFinal = finalAnswer === currentMc.correctId;
        setMcAttemptsRecord((prev) => ({
          ...prev,
          [currentMc.id]: {
            questionId: currentMc.id,
            first_selected_answer: firstAnswer,
            final_selected_answer: finalAnswer,
            is_correct_first_try: isCorrectFirst,
            is_correct_final: isCorrectFinal,
            attempts_count: mcAttempts,
            hints_used_count: mcHintsUsed,
            completed_at: new Date().toISOString(),
          },
        }));
      }
      setMcAnswers(nextMc);

      const pool =
        activeModule === 'reading' ? B4_BASELINE_READING_QUESTIONS : B4_BASELINE_FOCUS_MOVES_QUESTIONS;
      if (questionIndex + 1 >= pool.length) {
        finishModule({ mc: nextMc });
        return;
      }
      setQuestionIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    playItemButton();
    if (activeModule === 'feelings') {
      if (questionIndex + 1 >= B4_BASELINE_FEELINGS_QUESTIONS.length) {
        finishModule({ feelings: feelingsAnswers });
        return;
      }
      setQuestionIndex((i) => i + 1);
    } else if (currentMc) {
      const pool =
        activeModule === 'reading' ? B4_BASELINE_READING_QUESTIONS : B4_BASELINE_FOCUS_MOVES_QUESTIONS;
      if (questionIndex + 1 >= pool.length) {
        finishModule({ mc: mcAnswers });
        return;
      }
      setQuestionIndex((i) => i + 1);
    }
    setSelected(null);
    setChecked(false);
    setFeedback(null);
  };

  const handleReturnToAdventureMap = useCallback(() => {
    playItemButton();
    const context = readWeeklyAdventureRouteContext(location.search);
    const week = context.week && context.week > 0 ? context.week : 1;
    navigate(resolveWeeklyAdventureReturnHref(location.pathname, week));
  }, [location.pathname, location.search, navigate, playItemButton]);

  const handleIdleEndSession = useCallback(() => {
    endProtectedChildSession(navigate, location.pathname);
  }, [location.pathname, navigate]);

  const handleExit = () => {
    if (view === 'courage-celebration') {
      handleReturnToAdventureMap();
      return;
    }
    if (embedded && onExit && view !== 'landing') {
      onExit();
      return;
    }
    if (view === 'quiz') {
      goHub();
      return;
    }
    if (view === 'hub' || view === 'module-complete' || view === 'final') {
      goLanding();
      return;
    }
    onExit?.();
  };

  const allComplete = isBaselineFullyComplete(hubState, readActiveChildParticipantId());
  const showTopBar = embedded || view !== 'landing';
  const avatarSrc = B4_AVATAR_SRC;
  const b4Flames = resolveGameplayTopBarFlames('b4', { useB4Header: true });

  const baselineScenarioPrompt =
    activeModule === 'feelings'
      ? 'Pick the answer that feels most like you. There are no bad answers.'
      : activeModule === 'reading' && questionIndex === 0
        ? 'Read the story, then answer what happened.'
        : 'Choose the best answer, then tap Check.';

  const baselineScenarioTag =
    activeModule === 'feelings'
      ? 'Feelings Check-In'
      : activeModule === 'reading'
        ? 'Reading'
        : 'Focus Moves';

  const baselineReadAloudSegments = useMemo(() => {
    const feelingsQuestion = B4_BASELINE_FEELINGS_QUESTIONS[questionIndex]?.text;
    const questionText = activeModule === 'feelings' ? feelingsQuestion : currentMc?.text;
    const choiceOrdinals = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

    let choices: string[] = [];
    if (activeModule === 'feelings') {
      choices = B4_BASELINE_SCALE.map(
        (row, index) => `Choice ${choiceOrdinals[index] ?? index + 1}. ${row.label}`,
      );
    } else if (currentMc) {
      choices = currentMc.choices.map(
        (row, index) => `Choice ${choiceOrdinals[index] ?? index + 1}. ${row.label}`,
      );
    }

    const questionSegments = buildReadAloudSegmentsFromParts({
      scenarioTitle: baselineScenarioTag,
      scenarioDescription: [
        baselineScenarioPrompt,
        activeModule === 'reading' && questionIndex === 0 ? B4_BASELINE_READING_PASSAGE : '',
      ]
        .filter(Boolean)
        .join(' '),
      question: questionText,
      choices,
    });

    const coachSegments = buildAssessmentCoachRailSegments({
      guideCharacter: 'b4',
      checked,
      feedback,
      hasSelection: selected != null,
      hasHints: Boolean(currentMc?.hints?.length),
    });

    return buildGameplayReadAloudSegments(
      questionSegments,
      coachSegments,
      checked ? 'coach_only' : 'full',
    );
  }, [
    activeModule,
    baselineScenarioPrompt,
    baselineScenarioTag,
    checked,
    currentMc,
    feedback,
    questionIndex,
    selected,
  ]);

  const baselineReadAloudResetKey = `${activeModule ?? 'module'}-${questionIndex}-${checked ? 'checked' : 'open'}`;

  return (
    <GameplayShell
      variant="b4"
      embedded={embedded}
      active={view === 'quiz'}
      coachingShell={view === 'quiz'}
      idleSessionGuard={{ enabled: view === 'quiz', onEndSession: handleIdleEndSession }}
      topBar={
        showTopBar ? (
          view === 'quiz' ? (
            <GameplayTopBar
              variant="b4"
              onBack={handleExit}
              progressPercent={progressPct}
              showProgress
              playerName={playerName}
              flameDisplay={b4Flames.flameDisplay}
              flamesLit={b4Flames.flamesLit}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
            />
          ) : (
            <B4BaselineTopBar
              progressPct={progressPct}
              onExit={handleExit}
              hubName={embedded ? (familyPortal ? 'Weekly Adventures' : 'B-4 Missions') : undefined}
              showProgress={view === 'hub'}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              playerName={playerName}
            />
          )
        ) : null
      }
      footer={
        view === 'quiz' ? (
          <B4BaselineBottomBar
            canCheck={selected != null && !checked}
            checked={checked}
            feedback={feedback}
            feedbackTone={feedbackTone}
            hideInlineFeedback
            coachingShell
            canTryAgain={canMcTryAgain}
            canUseHint={canMcUseHint}
            activeHint={activeHint}
            onSkip={handleSkip}
            onCheck={handleCheck}
            onContinue={() => {
              if (!canMcContinue && activeModule !== 'feelings') return;
              advanceQuestion();
            }}
            onTryAgain={handleMcTryAgain}
            onUseHint={handleMcUseHint}
          />
        ) : null
      }
    >
      <main className={`bbc-main${view === 'landing' ? ' bbc-main--landing' : ''}${view === 'quiz' ? ' bbc-main--quiz' : ''}`}>
        {view === 'landing' ? (
          familyPortal ? (
            <>
              {embedded && onExit && !showTopBar ? (
                <button type="button" className="bbc-embeddedBack" onClick={onExit}>
                  ← Back to Adventure Map
                </button>
              ) : null}
              {profileError ? (
                <p className="bbc-profileError" role="alert">
                  {profileError}
                </p>
              ) : null}
              <B4BaselineFamilyEntry
                childName={resolvedChildName}
                checkInStatus={familyCheckInStatus}
                roster={familyRoster}
                activeParticipantId={resolvedParticipantId}
                needsChildSelection={familyNeedsChildSelection}
                noChildren={familyNoChildren}
                childrenSettingsPath={childrenSettingsPath}
                continueLearningPath={continueLearningPath}
                onSelectChild={handleFamilySelectChild}
                onStartCheckIn={() => void handleStartFamilyCheckIn()}
                starting={profileSubmitting}
              />
            </>
          ) : (
          <div className="bbc-landing">
            {embedded && onExit && !showTopBar ? (
              <button type="button" className="bbc-embeddedBack" onClick={onExit}>
                ← Back to B-4 Missions
              </button>
            ) : null}
            <p className="bbc-eyebrow">{landingCopy.eyebrow}</p>
            <h1 className="bbc-title">{landingCopy.title}</h1>
            <p className="bbc-subtitle">{landingCopy.subtitle}</p>
            <B4Avatar size="hero" src={avatarSrc} />
            <p className="bbc-body">{landingCopy.body}</p>
            {profileError ? (
              <p className="bbc-profileError" role="alert">
                {profileError}
              </p>
            ) : null}
            <B4BaselineStudentForm
              familyPortal={familyPortal}
              initialFirstName={hubState.profile?.firstName ?? ''}
              initialNickname={
                hubState.profile?.nickname ?? readGameplayPlayerDisplayName() ?? ''
              }
              initialProgramCode={
                programContext?.programCode ?? hubState.profile?.programCode ?? ''
              }
              initialGroupName={
                programContext?.groupName ?? hubState.profile?.groupName ?? ''
              }
              submitting={profileSubmitting}
              onSubmit={(values) => void handleStudentSubmit(values)}
            />
          </div>
          )
        ) : null}

        {view === 'grade_gate' && gradeGateParticipantId && pendingBaselineStart ? (
          <div className="bbc-landing">
            <B4BaselineGradeGate
              participantId={gradeGateParticipantId}
              submitting={profileSubmitting}
              onComplete={() => {
                playContinue();
                finishBaselineProfileStart(
                  pendingBaselineStart.participant,
                  pendingBaselineStart.values,
                );
                setPendingBaselineStart(null);
                setGradeGateParticipantId(null);
              }}
            />
          </div>
        ) : null}

        {view === 'hub' ? (
          <B4BaselineHub
            completedModules={hubState.completedModules}
            allComplete={allComplete}
            onStartModule={openModule}
            onViewResults={() => setView('final')}
          />
        ) : null}

        {view === 'quiz' && activeModule ? (
          <GameInteractionShell className="shared-mission-game shared-mission-game--coachingRail">
            <B4CheckInStepGraphic module={activeModule} questionIndex={questionIndex} />
            <CoachingShellQuizFrame
              scenario={
                <>
                  <ScenarioCard
                    sceneLabel="Scenario"
                    tag={baselineScenarioTag}
                    storyPrompt={baselineScenarioPrompt}
                    characterId="b4"
                    avatarSrc={avatarSrc}
                    avatarAlt="B-4"
                  />
                  {activeModule === 'reading' && questionIndex === 0 ? (
                    <div className="bbc-passage">{B4_BASELINE_READING_PASSAGE}</div>
                  ) : null}
                </>
              }
              question={
                <h2 className="bbc-questionText mission-questionText" id="bbc-question">
                  {activeModule === 'feelings'
                    ? B4_BASELINE_FEELINGS_QUESTIONS[questionIndex]?.text
                    : currentMc?.text}
                </h2>
              }
              answers={
                activeModule === 'feelings' ? (
                  <div className="bbc-answers bbc-scaleGrid" role="group" aria-labelledby="bbc-question">
                    {B4_BASELINE_SCALE.map(({ value, label }) => {
                      const isSelected = selected === value;
                      const isChecked = checked && isSelected;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={checked}
                          className={[
                            'bbc-answerCard',
                            'bbc-scaleCard',
                            isSelected ? 'bbc-answerCard--selected' : '',
                            isChecked ? 'bbc-answerCard--correct' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => {
                            playSelect();
                            setSelected(value);
                          }}
                          aria-pressed={isSelected}
                        >
                          <span className="bbc-scaleNum">{value}</span>
                          <span className="bbc-scaleLabel">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bbc-answers" role="group" aria-labelledby="bbc-question">
                    {currentMc?.choices.map((choice) => {
                      const isSelected = selected === choice.id;
                      const isCorrect = checked && choice.id === currentMc.correctId;
                      const isWrong = checked && isSelected && choice.id !== currentMc.correctId;
                      const lockChoice = checked && !canMcTryAgain;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          disabled={lockChoice}
                          className={[
                            'bbc-answerCard',
                            isSelected && !checked ? 'bbc-answerCard--selected' : '',
                            isCorrect ? 'bbc-answerCard--correct' : '',
                            isWrong ? 'bbc-answerCard--wrong' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => {
                            playSelect();
                            setSelected(choice.id);
                          }}
                          aria-pressed={isSelected}
                        >
                          {choice.label}
                        </button>
                      );
                    })}
                  </div>
                )
              }
              coachRail={
                <AssessmentCoachRail
                  guideCharacter="b4"
                  checked={checked}
                  feedback={feedback}
                  feedbackTone={feedbackTone}
                  hasSelection={selected != null}
                  hasHints={Boolean(currentMc?.hints?.length)}
                />
              }
              readAloudSegments={baselineReadAloudSegments}
              readAloudResetKey={baselineReadAloudResetKey}
            />
          </GameInteractionShell>
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

        {view === 'module-complete' ? (
          <div className="bbc-resultPanel">
            <B4CheckInStepGraphic module="feelings" variant="complete" />
            <B4Avatar size="hero" src={avatarSrc} />
            <h2 className="bbc-title">{B4_BASELINE_MODULE_COMPLETE.title}</h2>
            <p className="bbc-body">{B4_BASELINE_MODULE_COMPLETE.copy}</p>
            <p className="bbc-deviceNote">Results are saved on this device for now.</p>
            <div className="bbc-resultActions">
              <button type="button" className="bbc-primaryBtn" onClick={goHub}>
                {B4_BASELINE_MODULE_COMPLETE.cta}
              </button>
            </div>
          </div>
        ) : null}

        {view === 'final' && hubState.record ? (
          <B4BaselineResults
            record={hubState.record}
            syncMessage={syncMessage}
            onBackToHub={goHub}
            onRetake={handleRetake}
            onRevealScore={handleRevealScore}
          />
        ) : null}
      </main>
    </GameplayShell>
  );
}
