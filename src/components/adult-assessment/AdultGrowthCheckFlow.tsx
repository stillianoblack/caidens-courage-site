import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuestionInteraction } from '../../hooks/useQuestionInteraction';
import { mergeAttemptIntoAnswersJson } from '../../lib/questionAttemptTracking';
import type { QuestionAttemptsMap } from '../../types/questionInteraction';
import {
  ADULT_POST_ASSESSMENT_TYPE,
  ADULT_PRE_ASSESSMENT_TYPE,
} from '../../config/assessmentTypeConstants';
import { resolveActiveProgramContext } from '../../config/activePilotProgram';
import { useSetMissionGamePhase } from '../../context/MissionGamePhaseContext';
import B4BaselineBottomBar from '../b4-baseline-check/B4BaselineBottomBar';
import B4BaselineTopBar from '../b4-baseline-check/B4BaselineTopBar';
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
import '../../design-system/game/gameDesignStyles';
import {
  ADULT_GROWTH_CHECK_NAME,
  ADULT_GROWTH_CHECK_QUESTIONS,
  scoreAdultAssessment,
  type AdultAssessmentPhase,
} from '../../data/adultGrowthCheckContent';
import { useBaselineCheckSounds } from '../../hooks/useBaselineCheckSounds';
import {
  buildAdultAssessmentRecord,
  findLatestAdultBaseline,
  loadAdultAssessmentSession,
  saveAdultAssessmentProfile,
  saveAdultAssessmentResult,
  type AdultAssessmentProfile,
  type AdultAssessmentRecord,
} from '../../lib/adultAssessmentStorage';
import { saveAdultAssessmentToSupabase } from '../../lib/assessmentResultsService';
import { resolveTrackingProgramCode } from '../../lib/activeProgramContext';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import {
  linkParentChildFromCampAssessment,
  shouldMigrateFromCampProgram,
} from '../../lib/parentChildLinkFromCampService';
import { refreshAnalyticsIdentity, trackEvent } from '../../lib/analytics';
import { endProtectedChildSession } from '../../lib/endProtectedChildSession';
import AdultInfoForm from './AdultInfoForm';
import AdultGrowthCheckResults from './AdultGrowthCheckResults';

type View = 'form' | 'quiz' | 'results';

type AdultGrowthCheckFlowProps = {
  phase: AdultAssessmentPhase;
  embedded?: boolean;
  familyPortal?: boolean;
  returnHref: string;
  drVictoriaTrainingHref?: string;
  continueLearningHref?: string;
  onExit?: () => void;
};

export default function AdultGrowthCheckFlow({
  phase,
  embedded = false,
  familyPortal = false,
  returnHref,
  drVictoriaTrainingHref,
  continueLearningHref,
  onExit,
}: AdultGrowthCheckFlowProps) {
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
  } = useBaselineCheckSounds();

  const [view, setView] = useState<View>('form');
  const [profile, setProfile] = useState<AdultAssessmentProfile | null>(
    () => loadAdultAssessmentSession().profile ?? null,
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptsRecord, setAttemptsRecord] = useState<QuestionAttemptsMap>({});
  const [resultRecord, setResultRecord] = useState<AdultAssessmentRecord | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [linkingPortal, setLinkingPortal] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const programContext = resolveActiveProgramContext();
  const collectChildLinking =
    familyPortal && phase === 'baseline' && shouldMigrateFromCampProgram();
  const totalQuestions = ADULT_GROWTH_CHECK_QUESTIONS.length;
  const currentQuestion = ADULT_GROWTH_CHECK_QUESTIONS[questionIndex];

  const interaction = useQuestionInteraction({
    questionId: currentQuestion?.id ?? '',
    hints: currentQuestion?.hints,
    explainMore: currentQuestion?.explainMore,
    maxAttempts: 1,
    isAnswerComplete: (value) => typeof value === 'string' && value.length > 0,
    isAnswerCorrect: (value) =>
      currentQuestion ? value === currentQuestion.correctId : false,
    getCorrectFeedback: () =>
      currentQuestion?.correctFeedback ??
      'Great reflection — that support mindset helps kids thrive.',
    getIncorrectFeedback: () =>
      currentQuestion?.incorrectFeedback ??
      'Not quite. The best answer focuses on understanding and support.',
  });

  const {
    answer: selected,
    checked,
    feedback,
    feedbackTone,
    canCheck,
    canContinue,
    selectAnswer,
    check: submitCheck,
    reset: resetInteraction,
    buildAttemptRecord,
  } = interaction;

  useEffect(() => {
    resetInteraction();
  }, [questionIndex, resetInteraction]);

  useSetMissionGamePhase(view === 'quiz' ? 'quiz' : view === 'results' ? 'complete' : 'landing');

  const progressPct = useMemo(() => {
    if (view === 'results') return 100;
    if (view === 'form') return 0;
    const step = checked ? questionIndex + 1 : questionIndex;
    return Math.round((step / totalQuestions) * 100);
  }, [checked, questionIndex, totalQuestions, view]);

  const resetQuiz = useCallback(() => {
    setQuestionIndex(0);
    setAnswers({});
    setAttemptsRecord({});
    resetInteraction();
  }, [resetInteraction]);

  const handleProfileSubmit = async (values: AdultAssessmentProfile) => {
    playSelect();
    setLinkError(null);

    let profileToSave = values;

    if (collectChildLinking) {
      const campProgram = readActivePilotProgram();
      if (!campProgram) {
        setLinkError('Camp program context is missing. Re-enter your family access code and try again.');
        return;
      }

      const parentLastName = values.lastName?.trim();
      const childFirstName = values.childFirstName?.trim();
      if (!parentLastName || !childFirstName) {
        setLinkError('Parent last name and child first name are required.');
        return;
      }

      setLinkingPortal(true);
      try {
        const linkResult = await linkParentChildFromCampAssessment({
          parentFirstName: values.firstName.trim(),
          parentLastName,
          parentEmail: values.email.trim(),
          childFirstName,
          childNickname: values.childNickname,
          parentRole: values.role,
          campProgram,
        });

        if (!linkResult.success || !linkResult.familyProgram) {
          setLinkError(
            linkResult.message ??
              'Could not set up your private family portal. Please try again.',
          );
          return;
        }

        profileToSave = {
          ...values,
          programCode: linkResult.familyProgram.programCode,
        };
      } finally {
        setLinkingPortal(false);
      }
    }

    saveAdultAssessmentProfile(profileToSave);
    setProfile(profileToSave);
    refreshAnalyticsIdentity();
    trackEvent('adult_assessment_started', {
      role: familyPortal ? 'parent' : 'facilitator',
      assessment_type: phase === 'baseline' ? ADULT_PRE_ASSESSMENT_TYPE : ADULT_POST_ASSESSMENT_TYPE,
    });
    resetQuiz();
    setView('quiz');
  };

  const finishAssessment = useCallback(
    async (finalAnswers: Record<string, string>, questionAttempts: QuestionAttemptsMap = {}) => {
      if (!profile) return;

      const scores = scoreAdultAssessment(finalAnswers);
      const trackingProgramCode = resolveTrackingProgramCode() ?? profile.programCode;
      const baseline =
        phase === 'growth'
          ? findLatestAdultBaseline(profile.email, trackingProgramCode)
          : null;

      const record = buildAdultAssessmentRecord({
        phase,
        profile: { ...profile, programCode: trackingProgramCode },
        ...scores,
        baseline,
      });

      saveAdultAssessmentResult(record);
      const submit = await saveAdultAssessmentToSupabase(record, {
        answersJson: mergeAttemptIntoAnswersJson(
          Object.fromEntries(Object.entries(finalAnswers)),
          questionAttempts,
        ),
      });
      trackEvent('adult_assessment_completed', {
        role: familyPortal ? 'parent' : 'facilitator',
        assessment_type: phase === 'baseline' ? ADULT_PRE_ASSESSMENT_TYPE : ADULT_POST_ASSESSMENT_TYPE,
        score: scores.totalScore,
        max_score: record.totalQuestions,
        percent_score:
          record.totalQuestions > 0
            ? Math.round((scores.totalScore / record.totalQuestions) * 100)
            : 0,
        understanding_score: scores.understandingScore,
        support_score: scores.supportScore,
      });

      setSyncMessage(submit.message);
      setResultRecord(record);
      setView('results');
      playModuleWin();
    },
    [familyPortal, phase, playModuleWin, profile],
  );

  const handleCheck = () => {
    if (!currentQuestion || !canCheck || typeof selected !== 'string') return;

    playSelect();
    const correct = selected === currentQuestion.correctId;
    submitCheck();
    if (correct) {
      playResultFeelings();
    }
  };

  const handleContinue = () => {
    if (!currentQuestion || typeof selected !== 'string' || !canContinue) return;

    playContinue();
    const attempt = buildAttemptRecord();
    const nextAttempts = { ...attemptsRecord, [currentQuestion.id]: attempt };
    const nextAnswers = { ...answers, [currentQuestion.id]: selected };

    if (questionIndex + 1 >= totalQuestions) {
      void finishAssessment(nextAnswers, nextAttempts);
      return;
    }

    setAnswers(nextAnswers);
    setAttemptsRecord(nextAttempts);
    setQuestionIndex((index) => index + 1);
  };

  const handleSkip = () => {
    playItemButton();
    if (!currentQuestion) return;

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: typeof selected === 'string' ? selected : '',
    };

    if (questionIndex + 1 >= totalQuestions) {
      void finishAssessment(nextAnswers, attemptsRecord);
      return;
    }

    setAnswers(nextAnswers);
    setQuestionIndex((index) => index + 1);
  };

  const handleIdleEndSession = useCallback(() => {
    endProtectedChildSession(navigate, location.pathname);
  }, [location.pathname, navigate]);

  const handleExit = () => {
    playItemButton();
    if (embedded && onExit && view === 'quiz') {
      onExit();
      return;
    }
    if (view === 'quiz') {
      setView('form');
      resetQuiz();
      return;
    }
    onExit?.();
  };

  const pageTitle =
    phase === 'baseline' ? 'Adult Baseline Assessment' : 'Adult Growth Assessment';

  const isVictoriaQuestion = currentQuestion?.domain === 'understanding';
  const quizGuideCharacter = isVictoriaQuestion ? 'dr-victoria' : 'uncle-t';
  const quizTopBarVariant = isVictoriaQuestion ? 'victoria' : 'uncle-t';

  const quizThemeClasses = [
    'adult-assessment-game',
    isVictoriaQuestion ? 'victoria-game bbc-app--adult-victoria' : 'uncle-t-game bbc-app--adult-uncleT',
  ].join(' ');

  const adultReadAloudSegments = useMemo(() => {
    if (!currentQuestion) return [];

    const questionSegments = buildReadAloudSegmentsFromParts({
      scenarioTitle: isVictoriaQuestion ? 'Understanding' : 'Support',
      scenarioDescription: 'Consider the situation carefully before you choose your answer.',
      question: currentQuestion.text,
      choices: currentQuestion.choices.map(
        (choice, index) =>
          `Choice ${['one', 'two', 'three', 'four', 'five', 'six'][index] ?? index + 1}. ${choice.label}`,
      ),
    });

    const coachSegments = buildAssessmentCoachRailSegments({
      guideCharacter: quizGuideCharacter,
      checked,
      feedback,
      hasSelection: typeof selected === 'string' && selected.length > 0,
      hasHints: Boolean(currentQuestion.hints?.length),
    });

    return buildGameplayReadAloudSegments(
      questionSegments,
      coachSegments,
      checked ? 'coach_only' : 'full',
    );
  }, [checked, currentQuestion, feedback, isVictoriaQuestion, quizGuideCharacter, selected]);

  return (
    <GameplayShell
      variant="adultAssessment"
      embedded={embedded}
      active={view === 'quiz'}
      coachingShell={view === 'quiz'}
      idleSessionGuard={{ enabled: view === 'quiz', onEndSession: handleIdleEndSession }}
      themeClassName={view === 'quiz' ? quizThemeClasses : 'adult-assessment-game bbc-app--adult'}
      topBar={
        embedded || view !== 'form' ? (
          view === 'quiz' ? (
            <GameplayTopBar
              variant={quizTopBarVariant}
              onBack={handleExit}
              progressPercent={progressPct}
              showProgress
              showFlameStatus={false}
              flameDisplay="none"
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
            />
          ) : (
            <B4BaselineTopBar
              progressPct={progressPct}
              onExit={handleExit}
              showProgress={false}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
            />
          )
        ) : null
      }
      footer={
        view === 'quiz' ? (
          <B4BaselineBottomBar
            canCheck={canCheck}
            checked={checked}
            feedback={null}
            feedbackTone={feedbackTone}
            hideInlineFeedback
            coachingShell
            onSkip={handleSkip}
            onCheck={handleCheck}
            onContinue={handleContinue}
          />
        ) : null
      }
    >
      <main
        className={[
          'bbc-main',
          view === 'form' ? 'bbc-main--landing' : '',
          view === 'quiz' ? 'bbc-main--quiz' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {view === 'form' ? (
          <div className="bbc-landing">
            {embedded && onExit ? (
              <button type="button" className="bbc-embeddedBack" onClick={onExit}>
                {familyPortal ? '← Back to Parent Corner' : '← Back to Assessments'}
              </button>
            ) : null}
            <p className="bbc-eyebrow">Focus Flame Academy</p>
            <h1 className="bbc-title">{ADULT_GROWTH_CHECK_NAME}</h1>
            <p className="bbc-subtitle">{pageTitle}</p>
            <p className="bbc-body">
              {phase === 'baseline'
                ? 'Answer 12 reflection questions to capture your starting support strengths.'
                : 'Retake the same 12 questions to measure your growth after training.'}
            </p>
            {linkError ? (
              <p className="bbc-feedback bbc-feedback--try" role="alert">
                {linkError}
              </p>
            ) : null}
            <AdultInfoForm
              initialFirstName={profile?.firstName ?? ''}
              initialLastName={profile?.lastName ?? ''}
              initialEmail={profile?.email ?? ''}
              initialChildFirstName={profile?.childFirstName ?? ''}
              initialChildNickname={profile?.childNickname ?? ''}
              initialProgramCode={programContext?.programCode ?? profile?.programCode ?? ''}
              programCodeReadOnly={familyPortal && Boolean(programContext?.programCode)}
              collectChildLinking={collectChildLinking}
              submitting={linkingPortal}
              onSubmit={(values) => {
                void handleProfileSubmit(values);
              }}
            />
          </div>
        ) : null}

        {view === 'quiz' && currentQuestion ? (
          <GameInteractionShell className="shared-mission-game shared-mission-game--coachingRail">
            <CoachingShellQuizFrame
              scenario={
                <ScenarioCard
                  sceneLabel="Training Scenario"
                  tag={isVictoriaQuestion ? 'Understanding' : 'Support'}
                  storyPrompt="Consider the situation carefully before you choose your answer."
                  characterId={isVictoriaQuestion ? 'dr-victoria' : 'uncle-t'}
                />
              }
              question={
                <h2 className="bbc-questionText mission-questionText" id="bbc-question">
                  {currentQuestion.text.split('\n').map((line, index) => (
                    <React.Fragment key={line}>
                      {index > 0 ? <br /> : null}
                      {line}
                    </React.Fragment>
                  ))}
                </h2>
              }
              answers={
                <div className="bbc-answers" role="group" aria-labelledby="bbc-question">
                  {currentQuestion.choices.map((choice) => {
                    const isSelected = selected === choice.id;
                    const isCorrect = checked && choice.id === currentQuestion.correctId;
                    const isWrong = checked && isSelected && choice.id !== currentQuestion.correctId;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        disabled={checked}
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
                          selectAnswer(choice.id);
                        }}
                        aria-pressed={isSelected}
                      >
                        <span className="bbc-answerLabel">{choice.label}</span>
                      </button>
                    );
                  })}
                </div>
              }
              coachRail={
                <AssessmentCoachRail
                  guideCharacter={quizGuideCharacter}
                  checked={checked}
                  feedback={feedback}
                  feedbackTone={feedbackTone}
                  hasSelection={typeof selected === 'string' && selected.length > 0}
                  hasHints={Boolean(currentQuestion.hints?.length)}
                />
              }
              readAloudSegments={adultReadAloudSegments}
              readAloudResetKey={`${currentQuestion.id}-${checked ? 'checked' : 'open'}`}
            />
          </GameInteractionShell>
        ) : null}

        {view === 'results' && resultRecord ? (
          <AdultGrowthCheckResults
            record={resultRecord}
            syncMessage={syncMessage}
            drVictoriaTrainingHref={drVictoriaTrainingHref}
            returnHref={returnHref}
            continueLearningHref={continueLearningHref}
            onContinueToTraining={() => playItemButton()}
            onReturn={() => playItemButton()}
            onContinueLearning={() => playItemButton()}
            onDownloadCertificate={() => playItemButton()}
          />
        ) : null}
      </main>
    </GameplayShell>
  );
}
