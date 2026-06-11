import React, { useCallback, useMemo, useState } from 'react';
import { useSetMissionGamePhase, type MissionGamePhase } from '../../context/MissionGamePhaseContext';
import CompletionCard from '../b4-guide/CompletionCard';
import ModeSelectCard from '../b4-guide/ModeSelectCard';
import ModuleStepCard from '../b4-guide/ModuleStepCard';
import QuestionCard from '../b4-guide/QuestionCard';
import ResultCard from '../b4-guide/ResultCard';
import '../b4-guide/b4-guide.css';
import {
  B4_ASSESSMENT_QUESTIONS,
  B4_COMPLETION,
  B4_GUIDE_MODE_OPTIONS,
  B4_GUIDE_PAGE_TITLE,
  B4_GUIDE_RESULTS,
  B4_MODULE_STEPS,
  B4_MODULE_TITLE,
  calculateAssessmentResult,
  type B4GuideResultType,
} from '../../data/b4GuideContent';
import { useBaselineCheckSounds } from '../../hooks/useBaselineCheckSounds';
import CharacterAvatar from '../game-assessment/shared/CharacterAvatar';
import SoundToggleButton from '../game-assessment/shared/SoundToggleButton';
import { B4_GAME_AVATAR_SRC } from '../../data/b4/portalAssets';

type Screen =
  | 'select'
  | 'assessment'
  | 'assessment-result'
  | 'module'
  | 'completion';

type B4GuideFlowProps = {
  embedded?: boolean;
  initialScreen?: Screen;
  onExit?: () => void;
};

const INITIAL_STATE = {
  screen: 'select' as Screen,
  assessmentAnswers: {} as Record<string, string>,
  assessmentIndex: 0,
  assessmentResult: null as B4GuideResultType | null,
  moduleStepIndex: 0,
  moduleAnswers: {} as Record<string, string>,
  focusMovePending: false,
};

export default function B4GuideFlow({
  embedded = false,
  initialScreen = 'select',
  onExit,
}: B4GuideFlowProps) {
  const { soundEnabled, toggleSound, playSelect, playModuleWin } = useBaselineCheckSounds();
  const [screen, setScreen] = useState<Screen>(initialScreen);

  const missionPhase: MissionGamePhase = useMemo(() => {
    if (screen === 'assessment' || screen === 'module') return 'quiz';
    if (screen === 'assessment-result' || screen === 'completion') return 'complete';
    if (screen === 'select') return 'landing';
    return 'off';
  }, [screen]);
  useSetMissionGamePhase(missionPhase);
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

  const resetAll = useCallback(() => {
    setScreen(initialScreen);
    setAssessmentAnswers(INITIAL_STATE.assessmentAnswers);
    setAssessmentIndex(INITIAL_STATE.assessmentIndex);
    setAssessmentResult(INITIAL_STATE.assessmentResult);
    setModuleStepIndex(INITIAL_STATE.moduleStepIndex);
    setModuleAnswers(INITIAL_STATE.moduleAnswers);
    setFocusMovePending(INITIAL_STATE.focusMovePending);
    setAssessmentSelected(null);
    setAssessmentChecked(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialScreen]);

  const handleBack = () => {
    if (screen === initialScreen && onExit) {
      onExit();
      return;
    }
    resetAll();
  };

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
    playSelect();
    setAssessmentSelected(choiceId);
  };

  const handleAssessmentCheck = () => {
    if (!assessmentSelected) return;
    playSelect();
    setAssessmentChecked(true);
  };

  const handleAssessmentContinue = () => {
    if (!assessmentSelected) return;
    playSelect();
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
    playSelect();
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
      playModuleWin();
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
    <main
      className={['b4g-app', embedded ? 'b4-guide--embedded' : '', embedded ? 'portal-gameFrame' : '']
        .filter(Boolean)
        .join(' ')}
      aria-label={B4_GUIDE_PAGE_TITLE}
    >
      <div className="b4g-shell">
        {embedded ? (
          <div className="b4g-portalTopBar">
            <span aria-hidden="true" />
            <SoundToggleButton soundEnabled={soundEnabled} onToggle={toggleSound} />
          </div>
        ) : null}

        {embedded && screen === initialScreen ? (
          <button type="button" className="b4g-back" onClick={handleBack}>
            ← Back to B-4 Missions
          </button>
        ) : screen !== initialScreen ? (
          <button type="button" className="b4g-back" onClick={resetAll}>
            ← Back to menu
          </button>
        ) : null}

        {embedded ? (
          <div className="b4g-portalHero">
            <CharacterAvatar
              src={B4_GAME_AVATAR_SRC}
              alt="B-4"
              size="medium"
              theme="b4"
              className="b4g-portalAvatar"
            />
          </div>
        ) : null}

        {screen === 'select' ? (
          <>
            <header className="b4g-header">
              <p className="b4g-eyebrow">Interactive check-in</p>
              <h1 className="b4g-title">{B4_GUIDE_PAGE_TITLE}</h1>
            </header>
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
  );
}
