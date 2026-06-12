import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CompletionCard from '../components/b4-guide/CompletionCard';
import PublicPilotExperienceGate from '../components/courage/PublicPilotExperienceGate';
import { B4_PILOT_MODAL_DESCRIPTION } from '../config/pilotAccess';
import ModeSelectCard from '../components/b4-guide/ModeSelectCard';
import ModuleStepCard from '../components/b4-guide/ModuleStepCard';
import QuestionCard from '../components/b4-guide/QuestionCard';
import ResultCard from '../components/b4-guide/ResultCard';
import '../components/b4-guide/b4-guide.css';
import {
  B4_ASSESSMENT_QUESTIONS,
  B4_COMPLETION,
  B4_GUIDE_MODE_OPTIONS,
  B4_GUIDE_PAGE_TITLE,
  B4_GUIDE_RESULTS,
  B4_GUIDE_SUBTITLE,
  B4_MODULE_STEPS,
  B4_MODULE_TITLE,
  calculateAssessmentResult,
  type B4GuideResultType,
} from '../data/b4GuideContent';

type Screen =
  | 'select'
  | 'assessment'
  | 'assessment-result'
  | 'module'
  | 'completion';

const INITIAL_STATE = {
  screen: 'select' as Screen,
  assessmentAnswers: {} as Record<string, string>,
  assessmentIndex: 0,
  assessmentResult: null as B4GuideResultType | null,
  moduleStepIndex: 0,
  moduleAnswers: {} as Record<string, string>,
  focusMovePending: false,
};

export default function B4GuidePage() {
  const [screen, setScreen] = useState<Screen>(INITIAL_STATE.screen);
  const [assessmentAnswers, setAssessmentAnswers] = useState(INITIAL_STATE.assessmentAnswers);
  const [assessmentIndex, setAssessmentIndex] = useState(INITIAL_STATE.assessmentIndex);
  const [assessmentResult, setAssessmentResult] = useState<B4GuideResultType | null>(
    INITIAL_STATE.assessmentResult,
  );
  const [moduleStepIndex, setModuleStepIndex] = useState(INITIAL_STATE.moduleStepIndex);
  const [moduleAnswers, setModuleAnswers] = useState(INITIAL_STATE.moduleAnswers);
  const [focusMovePending, setFocusMovePending] = useState(INITIAL_STATE.focusMovePending);
  const [assessmentSelected, setAssessmentSelected] = useState<string | null>(null);
  const [assessmentChecked, setAssessmentChecked] = useState(false);

  useEffect(() => {
    document.title = `${B4_GUIDE_PAGE_TITLE} | Caiden's Courage`;
  }, []);

  const resetAll = useCallback(() => {
    setScreen(INITIAL_STATE.screen);
    setAssessmentAnswers(INITIAL_STATE.assessmentAnswers);
    setAssessmentIndex(INITIAL_STATE.assessmentIndex);
    setAssessmentResult(INITIAL_STATE.assessmentResult);
    setModuleStepIndex(INITIAL_STATE.moduleStepIndex);
    setModuleAnswers(INITIAL_STATE.moduleAnswers);
    setFocusMovePending(INITIAL_STATE.focusMovePending);
    setAssessmentSelected(null);
    setAssessmentChecked(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const startAssessment = () => {
    setAssessmentAnswers({});
    setAssessmentIndex(0);
    setAssessmentResult(null);
    setAssessmentSelected(null);
    setAssessmentChecked(false);
    setScreen('assessment');
  };

  const startModule = () => {
    setModuleAnswers({});
    setModuleStepIndex(0);
    setFocusMovePending(false);
    setScreen('module');
  };

  const handleAssessmentSelect = (choiceId: string) => {
    setAssessmentSelected(choiceId);
  };

  const handleAssessmentCheck = () => {
    if (!assessmentSelected) return;
    setAssessmentChecked(true);
  };

  const handleAssessmentContinue = () => {
    if (!assessmentSelected) return;
    const question = B4_ASSESSMENT_QUESTIONS[assessmentIndex];
    const nextAnswers = { ...assessmentAnswers, [question.id]: assessmentSelected };
    setAssessmentAnswers(nextAnswers);
    setAssessmentSelected(null);
    setAssessmentChecked(false);

    if (assessmentIndex + 1 >= B4_ASSESSMENT_QUESTIONS.length) {
      const resultType = calculateAssessmentResult(nextAnswers);
      setAssessmentResult(resultType);
      setScreen('assessment-result');
      return;
    }

    setAssessmentIndex((i) => i + 1);
  };

  const handleModuleSelect = (choiceId: string) => {
    const step = B4_MODULE_STEPS[moduleStepIndex];
    const nextAnswers = { ...moduleAnswers, [step.id]: choiceId };
    setModuleAnswers(nextAnswers);

    if (step.kind === 'focus-move') {
      setFocusMovePending(true);
      return;
    }

    advanceModule();
  };

  const advanceModule = () => {
    setFocusMovePending(false);
    if (moduleStepIndex + 1 >= B4_MODULE_STEPS.length) {
      setScreen('completion');
      return;
    }
    setModuleStepIndex((i) => i + 1);
  };

  const currentModuleStep = B4_MODULE_STEPS[moduleStepIndex];
  const focusMoveInstruction =
    currentModuleStep?.kind === 'focus-move' && moduleAnswers['focus-move']
      ? currentModuleStep.instructions[moduleAnswers['focus-move']]
      : null;

  return (
    <PublicPilotExperienceGate interestType="b4_tools" description={B4_PILOT_MODAL_DESCRIPTION}>
      <main className="b4g-app" aria-label={B4_GUIDE_PAGE_TITLE}>
      <div className="b4g-shell">
        {screen !== 'select' ? (
          <button type="button" className="b4g-back" onClick={resetAll}>
            ← Back to menu
          </button>
        ) : (
          <Link to="/" className="b4g-back">
            ← Caiden&apos;s Courage home
          </Link>
        )}

        <header className="b4g-header">
          <p className="b4g-eyebrow">Interactive check-in</p>
          <h1 className="b4g-title">{B4_GUIDE_PAGE_TITLE}</h1>
          {screen === 'select' ? <p className="b4g-subtitle">{B4_GUIDE_SUBTITLE}</p> : null}
        </header>

        {screen === 'select' ? (
          <>
            <h2 className="b4g-screen-title">What do you want to try first?</h2>
            <div className="b4g-mode-grid">
              {B4_GUIDE_MODE_OPTIONS.map((option) => (
                <ModeSelectCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  cta={option.cta}
                  onSelect={option.id === 'assessment' ? startAssessment : startModule}
                />
              ))}
            </div>
          </>
        ) : null}

        {screen === 'assessment' ? (
          <QuestionCard
            prompt={B4_ASSESSMENT_QUESTIONS[assessmentIndex].prompt}
            choices={B4_ASSESSMENT_QUESTIONS[assessmentIndex].choices}
            current={assessmentIndex + 1}
            total={B4_ASSESSMENT_QUESTIONS.length}
            progressLabel={`Question ${assessmentIndex + 1} of ${B4_ASSESSMENT_QUESTIONS.length}`}
            selectedId={assessmentSelected}
            checked={assessmentChecked}
            onSelect={handleAssessmentSelect}
            onCheck={handleAssessmentCheck}
            onContinue={handleAssessmentContinue}
          />
        ) : null}

        {screen === 'assessment-result' && assessmentResult ? (
          <ResultCard
            result={B4_GUIDE_RESULTS[assessmentResult]}
            onStartWeek1={startModule}
            onBack={resetAll}
          />
        ) : null}

        {screen === 'module' && currentModuleStep ? (
          <>
            {moduleStepIndex === 0 ? (
              <h2 className="b4g-screen-title">{B4_MODULE_TITLE}</h2>
            ) : null}
            <ModuleStepCard
              step={currentModuleStep}
              stepIndex={moduleStepIndex}
              totalSteps={B4_MODULE_STEPS.length}
              selectedChoiceId={moduleAnswers[currentModuleStep.id]}
              instruction={focusMovePending ? focusMoveInstruction : null}
              onSelect={handleModuleSelect}
              onContinue={currentModuleStep.kind === 'focus-move' ? advanceModule : undefined}
            />
          </>
        ) : null}

        {screen === 'completion' ? (
          <CompletionCard
            title={B4_COMPLETION.title}
            b4Message={B4_COMPLETION.b4Message}
            badge={B4_COMPLETION.badge}
            onTryAgain={resetAll}
          />
        ) : null}
      </div>
    </main>
    </PublicPilotExperienceGate>
  );
}
