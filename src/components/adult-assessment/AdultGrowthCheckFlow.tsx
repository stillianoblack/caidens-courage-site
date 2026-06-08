import React, { useCallback, useMemo, useState } from 'react';
import { resolveActiveProgramContext } from '../../config/activePilotProgram';
import { useSetMissionGamePhase } from '../../context/MissionGamePhaseContext';
import B4BaselineBottomBar from '../b4-baseline-check/B4BaselineBottomBar';
import B4BaselineTopBar, { B4BaselineDecor } from '../b4-baseline-check/B4BaselineTopBar';
import '../b4-baseline-check/b4-baseline-check.css';
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
import { insertAdultAssessmentResult } from '../../lib/assessmentResultsService';
import { refreshAnalyticsIdentity, trackEvent } from '../../lib/analytics';
import { recordFormalAssessmentCompletion } from '../../lib/recordInteractiveCompletion';
import { DR_VICTORIA_GUIDE_SRC, UNCLE_T_GUIDE_SRC } from '../../data/adult/sharedAssets';
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
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'try' | 'neutral'>('neutral');
  const [resultRecord, setResultRecord] = useState<AdultAssessmentRecord | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const programContext = resolveActiveProgramContext();
  const totalQuestions = ADULT_GROWTH_CHECK_QUESTIONS.length;
  const currentQuestion = ADULT_GROWTH_CHECK_QUESTIONS[questionIndex];

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
    setSelected(null);
    setChecked(false);
    setFeedback(null);
    setFeedbackTone('neutral');
  }, []);

  const handleProfileSubmit = (values: AdultAssessmentProfile) => {
    playSelect();
    saveAdultAssessmentProfile(values);
    setProfile(values);
    refreshAnalyticsIdentity();
    trackEvent('adult_assessment_started', {
      role: familyPortal ? 'parent' : 'facilitator',
      assessment_type: phase === 'baseline' ? 'adult_pre' : 'adult_post',
    });
    resetQuiz();
    setView('quiz');
  };

  const finishAssessment = useCallback(
    async (finalAnswers: Record<string, string>) => {
      if (!profile) return;

      const scores = scoreAdultAssessment(finalAnswers);
      const baseline =
        phase === 'growth'
          ? findLatestAdultBaseline(profile.email, profile.programCode)
          : null;

      const record = buildAdultAssessmentRecord({
        phase,
        profile,
        ...scores,
        baseline,
      });

      saveAdultAssessmentResult(record);
      const v2Submit = await recordFormalAssessmentCompletion({
        assessmentType: phase === 'baseline' ? 'adult_pre' : 'adult_post',
        role: 'adult',
        participant: {
          first_name: profile.firstName,
          email: profile.email,
          adult_role: profile.role,
          program_code: profile.programCode,
          organization: profile.organization,
          child_age_range: profile.childAgeRange,
          email_opt_in: profile.emailOptIn,
        },
        understanding_score: scores.understandingScore,
        support_score: scores.supportScore,
        total_score: scores.totalScore,
        max_score: record.totalQuestions,
        answers_json: finalAnswers,
        completed_at: record.completedAt,
      });
      const submit = await insertAdultAssessmentResult(record);
      trackEvent('adult_assessment_completed', {
        role: familyPortal ? 'parent' : 'facilitator',
        assessment_type: phase === 'baseline' ? 'adult_pre' : 'adult_post',
        score: scores.totalScore,
        max_score: record.totalQuestions,
        percent_score:
          record.totalQuestions > 0
            ? Math.round((scores.totalScore / record.totalQuestions) * 100)
            : 0,
        understanding_score: scores.understandingScore,
        support_score: scores.supportScore,
      });

      const syncParts = [submit.message, v2Submit.warning].filter(Boolean);
      setSyncMessage(syncParts.join(' ') || submit.message);
      setResultRecord(record);
      setView('results');
      playModuleWin();
    },
    [familyPortal, phase, playModuleWin, profile],
  );

  const handleCheck = () => {
    if (!currentQuestion || !selected) return;

    playSelect();
    const correct = selected === currentQuestion.correctId;
    setChecked(true);
    setFeedback(
      correct
        ? 'Great reflection — that support mindset helps kids thrive.'
        : 'Good try — the best answer focuses on understanding and support.',
    );
    setFeedbackTone(correct ? 'success' : 'try');
    if (correct) {
      playResultFeelings();
    }
  };

  const handleContinue = () => {
    if (!currentQuestion || !selected) return;

    playContinue();
    const nextAnswers = { ...answers, [currentQuestion.id]: selected };

    if (questionIndex + 1 >= totalQuestions) {
      void finishAssessment(nextAnswers);
      return;
    }

    setAnswers(nextAnswers);
    setQuestionIndex((index) => index + 1);
    setSelected(null);
    setChecked(false);
    setFeedback(null);
    setFeedbackTone('neutral');
  };

  const handleSkip = () => {
    playItemButton();
    if (!currentQuestion) return;

    const nextAnswers = { ...answers, [currentQuestion.id]: selected ?? '' };

    if (questionIndex + 1 >= totalQuestions) {
      void finishAssessment(nextAnswers);
      return;
    }

    setAnswers(nextAnswers);
    setQuestionIndex((index) => index + 1);
    setSelected(null);
    setChecked(false);
    setFeedback(null);
    setFeedbackTone('neutral');
  };

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
  const guidePortraitSrc = isVictoriaQuestion ? DR_VICTORIA_GUIDE_SRC : UNCLE_T_GUIDE_SRC;
  const guideSpeech = isVictoriaQuestion
    ? 'Dr. Victoria reflection — choose the most helpful response.'
    : 'Uncle T coaching moment — what would help most?';

  return (
    <div
      className={[
        'bbc-app',
        'bbc-app--adult',
        view === 'quiz' && isVictoriaQuestion ? 'bbc-app--adult-victoria' : '',
        view === 'quiz' && !isVictoriaQuestion ? 'bbc-app--adult-uncleT' : '',
        embedded ? 'b4-game--embedded' : '',
        embedded ? 'portal-gameFrame' : '',
        view === 'quiz' ? 'bbc-app--game-active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <B4BaselineDecor />

      {embedded || view !== 'form' ? (
        <B4BaselineTopBar
          progressPct={progressPct}
          onExit={handleExit}
          showProgress={view === 'quiz'}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      ) : null}

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
            <AdultInfoForm
              initialFirstName={profile?.firstName ?? ''}
              initialEmail={profile?.email ?? ''}
              initialProgramCode={profile?.programCode ?? programContext?.programCode ?? ''}
              programCodeReadOnly={familyPortal && Boolean(programContext?.programCode)}
              onSubmit={handleProfileSubmit}
            />
          </div>
        ) : null}

        {view === 'quiz' && currentQuestion ? (
          <div
            className={[
              'bbc-quizWrap',
              'bbc-quizWrap--adult',
              isVictoriaQuestion ? 'bbc-quizWrap--victoria' : 'bbc-quizWrap--uncleT',
            ].join(' ')}
          >
            <div className="bbc-quizPrompt">
              <div className="bbc-quizB4 bbc-quizGuide" aria-hidden="true">
                <img src={guidePortraitSrc} alt="" decoding="async" />
              </div>
              <div
                className={[
                  'bbc-speechBubble',
                  'bbc-speechBubble--adult',
                  isVictoriaQuestion ? 'bbc-speechBubble--victoria' : 'bbc-speechBubble--uncleT',
                ].join(' ')}
              >
                {guideSpeech}
              </div>
            </div>

            <h2 className="bbc-questionText bbc-questionText--centered" id="bbc-question">
              {currentQuestion.text.split('\n').map((line, index) => (
                <React.Fragment key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </React.Fragment>
              ))}
            </h2>

            <div
              className="bbc-answers bbc-answers--centered"
              role="group"
              aria-labelledby="bbc-question"
            >
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
                      'bbc-answerCard--assessment',
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
                    <span className="bbc-answerLabel">{choice.label}</span>
                  </button>
                );
              })}
            </div>

            {feedback ? (
              <p
                className={[
                  'bbc-feedback',
                  feedbackTone === 'success' ? 'bbc-feedback--success' : '',
                  feedbackTone === 'try' ? 'bbc-feedback--try' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="status"
              >
                {feedback}
              </p>
            ) : null}
          </div>
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

      {view === 'quiz' ? (
        <B4BaselineBottomBar
          canCheck={Boolean(selected)}
          checked={checked}
          feedback={null}
          feedbackTone={feedbackTone}
          onSkip={handleSkip}
          onCheck={handleCheck}
          onContinue={handleContinue}
        />
      ) : null}
    </div>
  );
}
