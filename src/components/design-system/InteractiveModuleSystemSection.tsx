import React, { useState } from 'react';
import {
  AnswerChoiceList,
  GameCoachingRailPlaceholder,
  GameShell,
  LearningMomentCard,
  ModuleFooter,
  QuestionCard,
} from '../../design-system';
import {
  INTERACTIVE_MODULE_COMPONENTS,
  INTERACTIVE_MODULE_EXAMPLES,
  INTERACTIVE_MODULE_RULES,
} from '../../design-system/game/interactiveModuleRegistry';
import { getB4LockInTip } from '../../design-system/game/getB4LockInTip';
import { CAIDEN_QUEST_1_CONFIG } from '../../data/caiden/quest1WhatComesFirst';
import {
  DEMO_B4_FEEDBACK_EXAMPLES,
  DEMO_EXPERT_INSIGHT,
  DEMO_GAME_OPTIONS,
  DEMO_GAME_QUESTION,
} from '../../data/designSystemGameDemoData';
import '../../design-system/game/game-learning.css';

const QUEST_Q1 = CAIDEN_QUEST_1_CONFIG.questions[0];

export default function InteractiveModuleSystemSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correctId = 'pack';

  const lockInTip =
    selectedId != null
      ? getB4LockInTip({
          portalType: 'facilitator',
          gameId: 'quest-1',
          moduleId: 'quest-1',
          questionId: QUEST_Q1.id,
          selectedAnswer: selectedId,
          isCorrect: selectedId === correctId,
          skillArea: 'focus',
          characterId: 'caiden',
          question: QUEST_Q1,
        })
      : null;

  return (
    <section id="interactive-modules" className="dsPageSection">
      <h2 className="dsPageSectionTitle">14. Interactive Module System</h2>
      <p className="dsPageSectionSub">
        <strong>GameShell</strong> is the standard wrapper for all question-based experiences — kid
        games, facilitator training, family activities, baseline checks, and adult assessments. Training
        modules are not a separate UI system; they use the same shell with different content and
        feedback variants.
      </p>

      <h3 className="dsPageSectionSub">Shared components</h3>
      <ul className="dsRegistryGuidelines">
        {Object.entries(INTERACTIVE_MODULE_COMPONENTS).map(([name, target]) => (
          <li key={name}>
            <strong>{name}</strong> → {target}
          </li>
        ))}
      </ul>

      <h3 className="dsPageSectionSub">Rules</h3>
      <ul className="dsRegistryGuidelines">
        {INTERACTIVE_MODULE_RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>

      <h3 className="dsPageSectionSub">Module types (all use GameShell pattern)</h3>
      <div className="dsRegistryTable">
        <table className="dsTable">
          <thead>
            <tr>
              <th>Type</th>
              <th>Example</th>
              <th>Feedback</th>
              <th>Runtime</th>
            </tr>
          </thead>
          <tbody>
            {INTERACTIVE_MODULE_EXAMPLES.map((row) => (
              <tr key={row.kind}>
                <td>{row.label}</td>
                <td>{row.routeExample}</td>
                <td>{row.feedbackVariant}</td>
                <td>{row.runtimeFlow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="dsPageSectionSub">Live facilitator shell demo</h3>
      <p className="dsPageNote">
        Before answer: compact B-4 placeholder. After selection: contextual B-4 Lock-In Tip. Continue
        aligns with the left game column via ModuleFooter.
      </p>

      <div className="mission-quizLayout mission-quizLayout--coachingRail mission-quizLayout--hasMission">
        <div className="mission-quizLayoutMission">
          <QuestionCard
            characterId="caiden"
            sceneLabel={DEMO_GAME_QUESTION.sceneLabel}
            tag={DEMO_GAME_QUESTION.tag}
            storyPrompt={DEMO_GAME_QUESTION.storyPrompt}
          />
        </div>
        <div className="mission-quizLayoutLearning">
          <h4 className="dsGameDemoPrompt">{DEMO_GAME_QUESTION.prompt}</h4>
          <AnswerChoiceList
            options={DEMO_GAME_OPTIONS}
            selectedId={selectedId}
            correctId={correctId}
            checked={checked}
            onSelect={(id) => {
              setSelectedId(id);
              setChecked(false);
            }}
          />
        </div>
        <aside className="mission-quizLayoutAside">
          <div className="mission-quizLayoutAsideInner">
            {lockInTip ? (
              <LearningMomentCard {...lockInTip} showRailChevron />
            ) : (
              <GameCoachingRailPlaceholder variant="b4" />
            )}
          </div>
        </aside>
      </div>

      <div className="dsPageRow" style={{ marginTop: '1rem' }}>
        <ModuleFooter
          coachingShell
          canCheck={Boolean(selectedId)}
          checked={checked}
          hideInlineFeedback
          onSkip={() => {
            setSelectedId(null);
            setChecked(false);
          }}
          onCheck={() => setChecked(true)}
          onContinue={() => {
            setSelectedId(null);
            setChecked(false);
          }}
        />
      </div>

      <h3 className="dsPageSectionSub">Feedback variants</h3>
      <h4 className="dsPageSectionSub">B-4 Lock-In — correct (facilitator)</h4>
      <LearningMomentCard {...DEMO_B4_FEEDBACK_EXAMPLES.facilitatorFocus} />

      <h4 className="dsPageSectionSub">B-4 Lock-In — incorrect (kid)</h4>
      <LearningMomentCard {...DEMO_B4_FEEDBACK_EXAMPLES.incorrectKid} />

      <h4 className="dsPageSectionSub">Facilitator insight (adult training)</h4>
      <LearningMomentCard
        variant="FACILITATOR_INSIGHT"
        headline={DEMO_EXPERT_INSIGHT.insight}
        whyItMatters={DEMO_EXPERT_INSIGHT.whyItMatters}
        tryThis={DEMO_EXPERT_INSIGHT.tryThis}
        watchFor={DEMO_EXPERT_INSIGHT.watchFor}
      />

      <h3 className="dsPageSectionSub">GameShell API (design-system primitive)</h3>
      <GameShell
        portalType="facilitator"
        gameTitle="Caiden's Focus Quest"
        participantName="Demo"
        progress={33}
        backLabel="Focus Flame Journey"
        lockInTipSlot={lockInTip ? <LearningMomentCard {...lockInTip} /> : null}
        footerSlot={
          <button type="button" className="dsBtnGold" disabled={!checked}>
            Continue
          </button>
        }
      >
        <QuestionCard
          characterId="caiden"
          sceneLabel="Mission Card"
          tag="GETTING STARTED"
          storyPrompt={DEMO_GAME_QUESTION.storyPrompt}
        />
        <h4 className="dsGameDemoPrompt">{DEMO_GAME_QUESTION.prompt}</h4>
      </GameShell>
    </section>
  );
}
