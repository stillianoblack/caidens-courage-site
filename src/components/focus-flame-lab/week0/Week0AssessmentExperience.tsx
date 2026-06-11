import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FocusFlameSoundMenu from '../FocusFlameSoundMenu';
import AdventureFlowLayout from '../AdventureFlowLayout';
import CompactB4HudCard from '../CompactB4HudCard';
import Week0Hub from './Week0Hub';
import Week0ProgressBar from './Week0ProgressBar';
import './week0-assessment.css';
import {
  WEEK_0_FINAL_COMPLETE,
  WEEK_0_FOCUS_STRATEGY_QUESTIONS,
  WEEK_0_MODULE_RESULT,
  WEEK_0_READING_PASSAGE,
  WEEK_0_READING_QUESTIONS,
  WEEK_0_SCALE_LABELS,
  WEEK_0_SEL_QUESTIONS,
  getWeek0ModuleQuestionCount,
  scoreWeek0McAnswers,
  scoreWeek0SelAnswers,
  type Week0McQuestion,
  type Week0ModuleId,
} from '../../../data/week0AssessmentContent';
import {
  isWeek0FullyComplete,
  loadWeek0HubState,
  markWeek0ModuleComplete,
  persistWeek0ResultToDatabase,
} from '../../../lib/week0AssessmentStorage';
import { FOCUS_FLAME_LAB_PATH } from '../../../config/courageRoutes';
import { useFocusFlameAudio } from '../../../hooks/useFocusFlameAudio';
import StepMicroFeedback from '../StepMicroFeedback';

type View = 'hub' | 'quiz' | 'module-result' | 'final-complete';

const CAIDEN_IMG = '/images/focus-flame-lab/thepath.webp';

const B4_SEL_CHECK = 'Thanks for sharing. B-4 is learning your focus style.';
const B4_MC_CORRECT = 'Yes! You got it.';

export default function Week0AssessmentExperience() {
  const navigate = useNavigate();
  const [hubState, setHubState] = useState(loadWeek0HubState);
  const [view, setView] = useState<View>('hub');
  const [activeModule, setActiveModule] = useState<Week0ModuleId | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selAnswers, setSelAnswers] = useState<Record<string, number>>({});
  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | number | null>(null);
  const [checked, setChecked] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [feedbackHeadline, setFeedbackHeadline] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [b4Message, setB4Message] = useState('Let\u2019s see where your Focus Flame starts.');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [soundMenuOpen, setSoundMenuOpen] = useState(false);

  const {
    soundEnabled,
    setSoundEnabled,
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    voiceEnabled,
    setVoiceEnabled,
    voiceVolume,
    setVoiceVolume,
    playButtonClick,
    playCardSelect,
    playUiConfirm,
  } = useFocusFlameAudio();

  useEffect(() => {
    document.title = "Week 0: Focus Check | Focus Flame Lab";
  }, []);

  const refreshHub = useCallback(() => setHubState(loadWeek0HubState()), []);

  const totalQuestions = activeModule ? getWeek0ModuleQuestionCount(activeModule) : 0;

  const currentMcQuestion: Week0McQuestion | null = useMemo(() => {
    if (activeModule === 'reading') return WEEK_0_READING_QUESTIONS[questionIndex] ?? null;
    if (activeModule === 'focus-strategy') return WEEK_0_FOCUS_STRATEGY_QUESTIONS[questionIndex] ?? null;
    return null;
  }, [activeModule, questionIndex]);

  const resetQuizState = () => {
    setQuestionIndex(0);
    setSelAnswers({});
    setMcAnswers({});
    setSelected(null);
    setChecked(false);
    setFeedbackHeadline(null);
    setFeedbackMessage(null);
  };

  const startModule = (moduleId: Week0ModuleId) => {
    playCardSelect();
    setActiveModule(moduleId);
    resetQuizState();
    setView('quiz');
    setB4Message('One question at a time. No bad answers — just check in with B-4.');
  };

  const goHub = () => {
    playButtonClick();
    setActiveModule(null);
    resetQuizState();
    setView('hub');
    refreshHub();
    setB4Message('Let\u2019s see where your Focus Flame starts.');
  };

  const handleCheck = () => {
    if (selected == null) return;
    playUiConfirm();
    setChecked(true);
    setFeedbackKey((k) => k + 1);

    if (activeModule === 'sel') {
      setFeedbackHeadline('Thanks for sharing!');
      setFeedbackMessage(B4_SEL_CHECK);
      setB4Message(B4_SEL_CHECK);
      return;
    }

    if (currentMcQuestion) {
      const correct = selected === currentMcQuestion.correctId;
      if (correct) {
        setFeedbackHeadline('Nice!');
        setFeedbackMessage(B4_MC_CORRECT);
        setB4Message(B4_MC_CORRECT);
      } else {
        setFeedbackHeadline('Not quite');
        setFeedbackMessage('Good try. Think it through and try again, or keep going when you are ready.');
        setB4Message('Choose your answer, then press Check.');
      }
    }
  };

  const finishModule = async (overrides?: {
    sel?: Record<string, number>;
    mc?: Record<string, string>;
  }) => {
    if (!activeModule) return;

    const existing = loadWeek0HubState();
    const partial = {
      selScore: existing.result?.selScore ?? 0,
      readingScore: existing.result?.readingScore ?? 0,
      focusStrategyScore: existing.result?.focusStrategyScore ?? 0,
    };

    if (activeModule === 'sel') {
      partial.selScore = scoreWeek0SelAnswers(overrides?.sel ?? selAnswers);
    } else if (activeModule === 'reading') {
      partial.readingScore = scoreWeek0McAnswers(
        WEEK_0_READING_QUESTIONS,
        overrides?.mc ?? mcAnswers,
      );
    } else {
      partial.focusStrategyScore = scoreWeek0McAnswers(
        WEEK_0_FOCUS_STRATEGY_QUESTIONS,
        overrides?.mc ?? mcAnswers,
      );
    }

    const next = markWeek0ModuleComplete(activeModule, partial);
    setHubState(next);

    if (isWeek0FullyComplete(next) && next.result) {
      const saveResult = await persistWeek0ResultToDatabase(next.result);
      setSyncMessage(saveResult.success ? null : saveResult.message);
    }

    setView('module-result');
    setB4Message(WEEK_0_MODULE_RESULT.copy);
  };

  const handleContinue = () => {
    if (!activeModule || selected == null) return;
    playButtonClick();

    if (activeModule === 'sel') {
      const q = WEEK_0_SEL_QUESTIONS[questionIndex];
      const nextSel = { ...selAnswers, [q.id]: selected as number };
      setSelAnswers(nextSel);

      if (questionIndex + 1 >= WEEK_0_SEL_QUESTIONS.length) {
        finishModule({ sel: nextSel });
        return;
      }
      setQuestionIndex((i) => i + 1);
    } else if (currentMcQuestion) {
      const nextMc = { ...mcAnswers, [currentMcQuestion.id]: String(selected) };
      setMcAnswers(nextMc);

      const pool =
        activeModule === 'reading' ? WEEK_0_READING_QUESTIONS : WEEK_0_FOCUS_STRATEGY_QUESTIONS;
      if (questionIndex + 1 >= pool.length) {
        finishModule({ mc: nextMc });
        return;
      }
      setQuestionIndex((i) => i + 1);
    }

    setSelected(null);
    setChecked(false);
    setFeedbackHeadline(null);
    setFeedbackMessage(null);
  };

  const handleBack = () => {
    playButtonClick();
    if (view === 'quiz' && questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
      setSelected(null);
      setChecked(false);
      setFeedbackHeadline(null);
      setFeedbackMessage(null);
      return;
    }
    goHub();
  };

  const allComplete = isWeek0FullyComplete(hubState);

  return (
    <div className="ffl-week0-screen">
      <div className="ffl-hudNavBar ffl-gameTopNav ffl-top-nav ffl-hudNavDesktop">
        <div className="ffl-hudNavLeft">
          <button type="button" className="ffl-back ffl-hudBack" onClick={handleBack}>
            ← Back
          </button>
          <Link to={FOCUS_FLAME_LAB_PATH} className="ffl-nav-button" onClick={playButtonClick}>
            Exit Game
          </Link>
        </div>
        <div className="ffl-hudNavRight">
          <FocusFlameSoundMenu
            open={soundMenuOpen}
            onOpenChange={setSoundMenuOpen}
            soundEnabled={soundEnabled}
            onSoundEnabledChange={setSoundEnabled}
            voiceEnabled={voiceEnabled}
            onVoiceEnabledChange={setVoiceEnabled}
            musicVolume={musicVolume}
            onMusicVolumeChange={setMusicVolume}
            sfxVolume={sfxVolume}
            onSfxVolumeChange={setSfxVolume}
            voiceVolume={voiceVolume}
            onVoiceVolumeChange={setVoiceVolume}
          />
        </div>
      </div>

      {view === 'hub' ? (
        <Week0Hub
          completedModules={hubState.completedModules}
          allComplete={allComplete}
          onStartModule={startModule}
          onViewFinal={() => setView('final-complete')}
        />
      ) : null}

      {view === 'quiz' && activeModule ? (
        <AdventureFlowLayout className="ffl-screen--stack">
          <div className="ffl-week0-quizLayout">
            <div className="ffl-week0-quizMain">
              <CompactB4HudCard message={b4Message} />
              <div className="ffl-selStep ffl-reasoningWhyStep" style={{ marginTop: '1rem' }}>
                <Week0ProgressBar
                  current={questionIndex + 1}
                  total={totalQuestions}
                  label={`Question ${questionIndex + 1} of ${totalQuestions}`}
                />

                {activeModule === 'reading' && questionIndex === 0 ? (
                  <div className="ffl-week0-passage">{WEEK_0_READING_PASSAGE}</div>
                ) : null}

                <header className="ffl-questionHeader ffl-step-header">
                  <div className="ffl-kicker">B-4 GUIDE</div>
                  <h2 className="ffl-h2">
                    {activeModule === 'sel'
                      ? WEEK_0_SEL_QUESTIONS[questionIndex]?.text
                      : currentMcQuestion?.text}
                  </h2>
                </header>

                {activeModule === 'sel' ? (
                  <div className="ffl-week0-scaleGrid" role="group" aria-label="Rate from 1 to 5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={[
                          'ffl-week0-scaleBtn',
                          selected === n ? 'ffl-week0-scaleBtn--selected' : '',
                          checked && selected === n ? 'ffl-week0-scaleBtn--checked' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => {
                          if (checked) return;
                          playCardSelect();
                          setSelected(n);
                        }}
                        aria-pressed={selected === n}
                      >
                        <span className="ffl-week0-scaleNum">{n}</span>
                        {WEEK_0_SCALE_LABELS[n]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="ffl-reasoningWhy-options" role="group">
                    {currentMcQuestion?.choices.map((choice) => {
                      const isSelected = selected === choice.id;
                      const isCorrect = checked && choice.id === currentMcQuestion.correctId;
                      const isWrong = checked && isSelected && choice.id !== currentMcQuestion.correctId;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          className={[
                            'ffl-reasoningWhy-option',
                            isSelected && !checked ? 'ffl-reasoningWhy-option--selected' : '',
                            isCorrect ? 'ffl-reasoningWhy-option--correct' : '',
                            isWrong ? 'ffl-reasoningWhy-option--wrong' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          disabled={checked}
                          onClick={() => {
                            if (checked) return;
                            playCardSelect();
                            setSelected(choice.id);
                          }}
                          aria-pressed={isSelected}
                        >
                          <span className="ffl-reasoningWhy-option-label">{choice.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <StepMicroFeedback
                  headline={feedbackHeadline}
                  message={feedbackMessage}
                  triggerKey={feedbackKey}
                />

                <div className="ffl-week0-bottomBar">
                  <button type="button" className="ffl-back" onClick={handleBack}>
                    Back
                  </button>
                  <div className="ffl-week0-bottomBar-actions">
                    {!checked ? (
                      <button
                        type="button"
                        className="ffl-ctaPrimary"
                        disabled={selected == null}
                        onClick={handleCheck}
                      >
                        Check
                      </button>
                    ) : (
                      <button type="button" className="ffl-ctaPrimary" onClick={handleContinue}>
                        Continue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <aside className="ffl-week0-caidenIllustration" aria-hidden="true">
              <img src={CAIDEN_IMG} alt="" decoding="async" />
            </aside>
          </div>
        </AdventureFlowLayout>
      ) : null}

      {view === 'module-result' ? (
        <div className="ffl-selStep" style={{ marginTop: '1rem' }}>
          <CompactB4HudCard message={WEEK_0_MODULE_RESULT.copy} />
          <div className={`ffl-week0-resultPanel ffl-week0-resultPanel--success`}>
            <h2 className="ffl-h2">{WEEK_0_MODULE_RESULT.title}</h2>
            <p className="ffl-sceneSelectSubtitle" style={{ marginTop: '0.75rem' }}>
              {WEEK_0_MODULE_RESULT.copy}
            </p>
            {syncMessage ? (
              <p className="ffl-week0-saveWarning" role="alert">
                {syncMessage}
              </p>
            ) : null}
          </div>
          <div className="ffl-stepActions">
            <button type="button" className="ffl-ctaPrimary" onClick={goHub}>
              {WEEK_0_MODULE_RESULT.cta}
            </button>
          </div>
        </div>
      ) : null}

      {view === 'final-complete' ? (
        <div className="ffl-selStep" style={{ marginTop: '1rem' }}>
          <CompactB4HudCard message={WEEK_0_FINAL_COMPLETE.copy} />
          <div className="ffl-week0-resultPanel ffl-week0-resultPanel--success">
            <h2 className="ffl-h2">{WEEK_0_FINAL_COMPLETE.title}</h2>
            <p className="ffl-sceneSelectSubtitle" style={{ marginTop: '0.75rem' }}>
              {WEEK_0_FINAL_COMPLETE.copy}
            </p>
            <div className="ffl-week0-finalBadge" role="status">
              ✦ Focus Flame Baseline Saved
            </div>
            {syncMessage ? (
              <p className="ffl-week0-saveWarning" role="alert">
                {syncMessage}
              </p>
            ) : null}
          </div>
          <div className="ffl-stepActions">
            <button
              type="button"
              className="ffl-ctaPrimary"
              onClick={() => {
                playButtonClick();
                navigate(FOCUS_FLAME_LAB_PATH);
              }}
            >
              {WEEK_0_FINAL_COMPLETE.cta}
            </button>
            <button type="button" className="ffl-nav-button" onClick={goHub}>
              Back to Week 0 Hub
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
