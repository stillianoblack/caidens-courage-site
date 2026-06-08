import React, { useCallback, useMemo, useState } from 'react';
import { readActivePilotProgram, resolveActiveProgramContext } from '../../config/activePilotProgram';
import { readActiveChildNickname } from '../../config/activeChildNickname';
import { useSetMissionGamePhase, type MissionGamePhase } from '../../context/MissionGamePhaseContext';
import B4BaselineBottomBar from '../b4-baseline-check/B4BaselineBottomBar';
import B4BaselineHub from '../b4-baseline-check/B4BaselineHub';
import B4BaselineResults from '../b4-baseline-check/B4BaselineResults';
import B4BaselineStudentForm from '../b4-baseline-check/B4BaselineStudentForm';
import B4BaselineTopBar, { B4Avatar, B4BaselineDecor } from '../b4-baseline-check/B4BaselineTopBar';
import '../b4-baseline-check/b4-baseline-check.css';
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
import B4CheckInStepGraphic from './B4CheckInStepGraphic';

type View = 'landing' | 'hub' | 'quiz' | 'module-complete' | 'final';

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
  } = useBaselineCheckSounds();

  const [hubState, setHubState] = useState(loadB4BaselineState);
  const [view, setView] = useState<View>('landing');

  const missionPhase: MissionGamePhase = useMemo(() => {
    if (view === 'quiz') return 'quiz';
    if (view === 'module-complete' || view === 'final') return 'complete';
    if (view === 'landing' || view === 'hub') return 'landing';
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
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const landingCopy = familyPortal ? B4_BASELINE_FAMILY_LANDING : B4_BASELINE_LANDING;
  const programContext = resolveActiveProgramContext();

  const refreshHub = useCallback(() => setHubState(loadB4BaselineState()), []);

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
  };

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

  const handleStudentSubmit = (values: { nickname: string; programCode: string; groupName: string }) => {
    playSelect();
    const activeProgram = readActivePilotProgram();
    const next = saveB4BaselineStudentProfile({
      nickname: values.nickname,
      programCode: activeProgram?.programCode || values.programCode,
      groupName: activeProgram?.groupName || values.groupName,
    });
    setHubState(next);
    refreshAnalyticsIdentity();
    trackEvent('student_assessment_started', {
      role: 'student',
      assessment_type: 'baseline',
    });
    setView('hub');
  };

  const handleRetake = () => {
    playItemButton();
    resetB4BaselineSession();
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

    const existing = loadB4BaselineState();
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

    const next = markBaselineModuleComplete(activeModule, scores);
    setHubState(next);
    playModuleWin();

    if (isBaselineFullyComplete(next) && next.record) {
      const submitResult = await submitBaselineResults(next.record);
      const record = next.record;
      const maxScore = (['feelings', 'reading', 'focus-moves'] as BaselineModuleId[]).reduce(
        (sum, moduleId) => sum + getBaselineModuleQuestionCount(moduleId),
        0,
      );
      const totalScore = record.feelingsScore + record.readingScore + record.focusMovesScore;
      trackEvent('student_assessment_completed', {
        role: 'student',
        assessment_type: 'baseline',
        score: totalScore,
        max_score: maxScore,
        percent_score: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
        understanding_score: record.readingScore,
        support_score: record.focusMovesScore,
      });
      setSyncMessage(submitResult.message);
      setView('final');
    } else {
      setView('module-complete');
    }
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
      const correct = selected === currentMc.correctId;
      if (correct) {
        setFeedback('Nice! You got it.');
        setFeedbackTone('success');
      } else {
        const label = currentMc.choices.find((c) => c.id === currentMc.correctId)?.label ?? '';
        setFeedback(`Good try. A strong choice: ${label}`);
        setFeedbackTone('try');
      }
    }
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
      const nextMc = overrides?.mc ?? {
        ...mcAnswers,
        ...(selected != null ? { [currentMc.id]: String(selected) } : mcAnswers),
      };
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

  const handleExit = () => {
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

  const allComplete = isBaselineFullyComplete(hubState);
  const showTopBar = embedded || view !== 'landing';
  const avatarSrc = B4_AVATAR_SRC;

  return (
    <div
      className={[
        'bbc-app',
        embedded ? 'b4-game--embedded' : '',
        embedded ? 'portal-gameFrame' : '',
        view === 'quiz' ? 'bbc-app--game-active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <B4BaselineDecor />

      {showTopBar ? (
        <B4BaselineTopBar
          progressPct={progressPct}
          onExit={handleExit}
          showProgress={view === 'quiz' || view === 'hub'}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      ) : null}

      <main className={`bbc-main${view === 'landing' ? ' bbc-main--landing' : ''}`}>
        {view === 'landing' ? (
          <div className="bbc-landing">
            {embedded && onExit ? (
              <button type="button" className="bbc-embeddedBack" onClick={onExit}>
                {familyPortal ? '← Back to Weekly Adventures' : '← Back to B-4 Missions'}
              </button>
            ) : null}
            <p className="bbc-eyebrow">{landingCopy.eyebrow}</p>
            <h1 className="bbc-title">{landingCopy.title}</h1>
            <p className="bbc-subtitle">{landingCopy.subtitle}</p>
            <B4Avatar size="hero" src={avatarSrc} />
            <p className="bbc-body">{landingCopy.body}</p>
            <B4BaselineStudentForm
              familyPortal={familyPortal}
              initialNickname={
                hubState.profile?.nickname ?? readActiveChildNickname() ?? ''
              }
              initialProgramCode={
                hubState.profile?.programCode ?? programContext?.programCode ?? ''
              }
              initialGroupName={
                hubState.profile?.groupName ?? programContext?.groupName ?? ''
              }
              onSubmit={handleStudentSubmit}
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
          <div className="bbc-quizWrap bbc-quizWrap--kidFriendly">
            <B4CheckInStepGraphic module={activeModule} questionIndex={questionIndex} />
            <div className="bbc-quizPrompt">
              <B4Avatar size="large" src={avatarSrc} />
              <div className="bbc-speechBubble">
                {activeModule === 'feelings'
                  ? 'Pick the answer that feels most like you. There are no bad answers.'
                  : activeModule === 'reading' && questionIndex === 0
                    ? 'Read the story, then answer what happened.'
                    : 'Choose the best answer, then tap Check.'}
              </div>
            </div>

            {activeModule === 'reading' && questionIndex === 0 ? (
              <div className="bbc-passage">{B4_BASELINE_READING_PASSAGE}</div>
            ) : null}

            <h2 className="bbc-questionText" id="bbc-question">
              {activeModule === 'feelings'
                ? B4_BASELINE_FEELINGS_QUESTIONS[questionIndex]?.text
                : currentMc?.text}
            </h2>

            {activeModule === 'feelings' ? (
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
                        setSelected(choice.id);
                      }}
                      aria-pressed={isSelected}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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

      {view === 'quiz' ? (
        <B4BaselineBottomBar
          canCheck={selected != null}
          checked={checked}
          feedback={feedback}
          feedbackTone={feedbackTone}
          onSkip={handleSkip}
          onCheck={handleCheck}
          onContinue={() => advanceQuestion()}
        />
      ) : null}
    </div>
  );
}
