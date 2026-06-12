import React, { useCallback, useMemo, useState } from 'react';
import { useSetMissionGamePhase, type MissionGamePhase } from '../../context/MissionGamePhaseContext';
import B4BaselineBottomBar from '../b4-baseline-check/B4BaselineBottomBar';
import '../b4-baseline-check/b4-baseline-check.css';
import CompletionCard from '../b4-guide/CompletionCard';
import ModeSelectCard from '../b4-guide/ModeSelectCard';
import ModuleStepCard from '../b4-guide/ModuleStepCard';
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
import { B4_GAME_AVATAR_SRC } from '../../data/b4/portalAssets';
import '../../design-system/game/gameDesignStyles';

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

  const isAssessmentQuiz = screen === 'assessment';
  const assessmentProgress = Math.round(
    ((assessmentIndex + (assessmentChecked ? 1 : 0)) / B4_ASSESSMENT_QUESTIONS.length) * 100,
  );
  const b4Flames = resolveGameplayTopBarFlames('b4', { useB4Header: true });
  const currentAssessmentQuestion = B4_ASSESSMENT_QUESTIONS[assessmentIndex];

  const guideReadAloudSegments = useMemo(() => {
    if (!currentAssessmentQuestion) return [];

    const questionSegments = buildReadAloudSegmentsFromParts({
      scenarioTitle: `Question ${assessmentIndex + 1} of ${B4_ASSESSMENT_QUESTIONS.length}`,
      scenarioDescription: 'Choose the answer that best describes your focus right now.',
      question: currentAssessmentQuestion.prompt,
      choices: currentAssessmentQuestion.choices.map(
        (choice, index) =>
          `Choice ${['one', 'two', 'three', 'four', 'five', 'six'][index] ?? index + 1}. ${choice.label}`,
      ),
    });

    const coachSegments = buildAssessmentCoachRailSegments({
      guideCharacter: 'b4',
      checked: assessmentChecked,
      hasSelection: Boolean(assessmentSelected),
    });

    return buildGameplayReadAloudSegments(
      questionSegments,
      coachSegments,
      assessmentChecked ? 'coach_only' : 'full',
    );
  }, [
    assessmentChecked,
    assessmentIndex,
    assessmentSelected,
    currentAssessmentQuestion,
  ]);

  const handleIdleReturn = useCallback(() => {
    if (embedded && onExit) {
      onExit();
      return;
    }
    resetAll();
  }, [embedded, onExit, resetAll]);

  if (embedded) {
    return (
      <GameplayShell
        variant="b4"
        embedded
        active={isAssessmentQuiz}
        coachingShell={isAssessmentQuiz}
        idleSessionGuard={{ enabled: isAssessmentQuiz, onReturn: handleIdleReturn }}
        topBar={
          <GameplayTopBar
            variant="b4"
            backLabel={screen === initialScreen ? 'Back to B-4 Missions' : 'Back to menu'}
            onBack={handleBack}
            progressPercent={assessmentProgress}
            showProgress={isAssessmentQuiz}
            flameDisplay={b4Flames.flameDisplay}
            flamesLit={b4Flames.flamesLit}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
          />
        }
        footer={
          isAssessmentQuiz ? (
            <B4BaselineBottomBar
              canCheck={Boolean(assessmentSelected) && !assessmentChecked}
              checked={assessmentChecked}
              hideInlineFeedback
              coachingShell
              onSkip={handleAssessmentContinue}
              onCheck={handleAssessmentCheck}
              onContinue={handleAssessmentContinue}
            />
          ) : null
        }
      >
        <main
          className={[
            'bbc-main',
            screen === 'select' ? 'bbc-main--landing' : '',
            isAssessmentQuiz ? 'bbc-main--quiz' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={B4_GUIDE_PAGE_TITLE}
        >
          {screen === 'select' ? (
            <div className="game-focusFlameLanding">
              <div className="game-focusFlameLandingMain">
                <div className="bbc-landing game-landing game-landing--focusFlameShell">
                  <p className="bbc-eyebrow">Interactive check-in</p>
                  <h1 className="bbc-title">{B4_GUIDE_PAGE_TITLE}</h1>
                  <h2 className="bbc-subtitle">What do you want to try first?</h2>
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
                </div>
              </div>
              <aside className="game-focusFlameLandingAside">
                <AssessmentCoachRail guideCharacter="b4" phase="landing" />
              </aside>
            </div>
          ) : null}

          {isAssessmentQuiz && currentAssessmentQuestion ? (
            <GameInteractionShell className="shared-mission-game shared-mission-game--coachingRail">
              <CoachingShellQuizFrame
                scenario={
                  <ScenarioCard
                    sceneLabel="Scenario"
                    tag={`Question ${assessmentIndex + 1} of ${B4_ASSESSMENT_QUESTIONS.length}`}
                    storyPrompt="Choose the answer that best describes your focus right now."
                    characterId="b4"
                    avatarSrc={B4_GAME_AVATAR_SRC}
                    avatarAlt="B-4"
                  />
                }
                question={
                  <h2 className="bbc-questionText mission-questionText" id="b4g-question-prompt">
                    {currentAssessmentQuestion.prompt}
                  </h2>
                }
                answers={
                  <div className="bbc-answers" role="group" aria-labelledby="b4g-question-prompt">
                    {currentAssessmentQuestion.choices.map((choice) => {
                      const isSelected = assessmentSelected === choice.id;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          className={[
                            'bbc-answerCard',
                            isSelected ? 'bbc-answerCard--selected' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          disabled={assessmentChecked}
                          aria-pressed={isSelected}
                          onClick={() => handleAssessmentSelect(choice.id)}
                        >
                          {choice.label}
                        </button>
                      );
                    })}
                  </div>
                }
                coachRail={
                  <AssessmentCoachRail
                    guideCharacter="b4"
                    checked={assessmentChecked}
                    hasSelection={Boolean(assessmentSelected)}
                  />
                }
                readAloudSegments={guideReadAloudSegments}
                readAloudResetKey={`${currentAssessmentQuestion.id}-${assessmentChecked ? 'checked' : 'open'}`}
              />
            </GameInteractionShell>
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
        </main>
      </GameplayShell>
    );
  }

  return (
    <main className="b4g-app" aria-label={B4_GUIDE_PAGE_TITLE}>
      <div className="b4g-shell">
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
