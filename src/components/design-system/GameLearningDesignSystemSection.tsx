import React, { useState } from 'react';
import {
  AnswerChoiceList,
  GameCoachingRailPlaceholder,
  GameShell,
  LearningMomentCard,
  QuestionCard,
  getArchetypeProfile,
  LEARNING_MOMENT_CARD_REGISTRY,
  LEARNING_MOMENT_VARIANTS,
} from '../../design-system';
import {
  DEMO_B4_FEEDBACK_EXAMPLES,
  DEMO_B4_PARENT_COACH,
  DEMO_CHARACTER_SAMPLES,
  DEMO_EXPERT_INSIGHT,
  DEMO_FAMILY_LOCK_IN,
  DEMO_GAME_OPTIONS,
  DEMO_GAME_QUESTION,
  DEMO_LOCK_IN_TIP,
} from '../../data/designSystemGameDemoData';
import { getB4LockInTip } from '../../design-system/game/getB4LockInTip';
import { CAIDEN_QUEST_1_CONFIG } from '../../data/caiden/quest1WhatComesFirst';

export default function GameLearningDesignSystemSection() {
  const [kidSelected, setKidSelected] = useState<string | null>(null);
  const [kidChecked, setKidChecked] = useState(false);
  const [adultSelected, setAdultSelected] = useState<string | null>(null);
  const [adultChecked, setAdultChecked] = useState(false);
  const [adultQuestionIndex, setAdultQuestionIndex] = useState(2);

  const kidCorrectId = 'pack';
  const adultCorrectId = 'pack';

  return (
    <section id="game-learning" className="dsPageSection">
      <h2 className="dsPageSectionTitle">13. Character + Learning Components</h2>
      <p className="dsPageSectionSub">
        <strong>LearningMomentCard</strong> is the official coaching pattern across Kids, Family, and
        Facilitator experiences. Mock data only — nothing writes to Supabase.
      </p>

      <h3 className="dsPageSectionSub">Character archetype registry</h3>
      <div className="dsPageGrid dsPageGrid--3">
        {DEMO_CHARACTER_SAMPLES.map((id) => {
          const archetype = getArchetypeProfile(id);
          if (!archetype) return null;
          return (
            <div key={id} className="dsCharacterSample">
              <img src={archetype.avatar} alt="" className="dsCharacterSampleAvatar" />
              <p className="dsCharacterSampleName">{archetype.name}</p>
              <p className="dsCharacterSampleMeta">{archetype.purpose}</p>
              <p className="dsCharacterSampleVoice">{archetype.description}</p>
              <p className="dsCharacterSampleComponents">
                {archetype.approvedComponentTypes.join(' · ')}
              </p>
            </div>
          );
        })}
      </div>

      <h3 className="dsPageSectionSub">LearningMomentCard — component registry</h3>
      <p className="dsPageNote">{LEARNING_MOMENT_CARD_REGISTRY.description}</p>
      <div className="dsRegistryTable">
        <p>
          <strong>Spacing:</strong> max-width {LEARNING_MOMENT_CARD_REGISTRY.spacingTokens.maxWidth},
          avatar {LEARNING_MOMENT_CARD_REGISTRY.spacingTokens.avatarSizeDesktop} desktop /{' '}
          {LEARNING_MOMENT_CARD_REGISTRY.spacingTokens.avatarSizeMobile} mobile
        </p>
        <ul className="dsRegistryGuidelines">
          {LEARNING_MOMENT_CARD_REGISTRY.usageGuidelines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <h3 className="dsPageSectionSub">Variant: B4_LOCK_IN</h3>
      <p className="dsPageNote">{LEARNING_MOMENT_VARIANTS.B4_LOCK_IN.usage.join(' · ')}</p>
      <LearningMomentCard {...DEMO_LOCK_IN_TIP} />

      <h3 className="dsPageSectionSub">B-4 Feedback Logic</h3>
      <p className="dsPageNote">
        <code>getB4LockInTip()</code> returns contextual coaching from question data, selected answer,
        skill area, character, and portal tone. Prefers authored <code>feedbackCorrect</code>,{' '}
        <code>lockInTipsCorrect</code>, and <code>feedbackDetail</code> when present.
      </p>
      <div className="dsRegistryTable">
        <p>
          <strong>Input:</strong> portalType, gameId, moduleId, questionId, selectedAnswer,
          isCorrect, skillArea, characterId, learningGoal, question
        </p>
        <p>
          <strong>Output:</strong> title, headline, body, tips[], tipsLabel, tone, variant
        </p>
      </div>

      <h4 className="dsPageSectionSub">Correct answer — kid tone (focus)</h4>
      <LearningMomentCard {...DEMO_B4_FEEDBACK_EXAMPLES.correctKid} />

      <h4 className="dsPageSectionSub">Incorrect answer — kid tone (focus)</h4>
      <LearningMomentCard {...DEMO_B4_FEEDBACK_EXAMPLES.incorrectKid} />

      <h4 className="dsPageSectionSub">Correct answer — family tone</h4>
      <LearningMomentCard {...DEMO_B4_FEEDBACK_EXAMPLES.correctFamily} />

      <h4 className="dsPageSectionSub">Incorrect answer — family tone</h4>
      <LearningMomentCard {...DEMO_B4_FEEDBACK_EXAMPLES.incorrectFamily} />

      <h4 className="dsPageSectionSub">Facilitator tone — focus skill</h4>
      <LearningMomentCard {...DEMO_B4_FEEDBACK_EXAMPLES.facilitatorFocus} />

      <h4 className="dsPageSectionSub">Emotional regulation skill</h4>
      <LearningMomentCard {...DEMO_B4_FEEDBACK_EXAMPLES.emotionalRegulation} />

      <h4 className="dsPageSectionSub">Reading confidence skill</h4>
      <LearningMomentCard {...DEMO_B4_FEEDBACK_EXAMPLES.readingConfidence} />

      <h4 className="dsPageSectionSub">Live answer-aware preview</h4>
      <p className="dsPageNote">
        Select an answer to see <code>getB4LockInTip</code> update from real Quest 1 question data.
      </p>
      <AnswerChoiceList
        options={DEMO_GAME_OPTIONS}
        selectedId={kidSelected}
        correctId={kidCorrectId}
        checked={kidChecked}
        onSelect={(id) => {
          setKidSelected(id);
          setKidChecked(true);
        }}
      />
      {kidChecked && kidSelected ? (
        <LearningMomentCard
          {...getB4LockInTip({
            portalType: 'facilitator',
            gameId: 'quest-1',
            moduleId: 'quest-1',
            questionId: 'cq1-q1',
            selectedAnswer: kidSelected,
            isCorrect: kidSelected === kidCorrectId,
            skillArea: 'focus',
            characterId: 'caiden',
            learningGoal: 'GETTING STARTED',
            question: {
              id: 'cq1-q1',
              type: 'multiple_choice',
              prompt: DEMO_GAME_QUESTION.prompt,
              question: DEMO_GAME_QUESTION.prompt,
              options: DEMO_GAME_OPTIONS,
              correctId: kidCorrectId,
              feedbackCorrect:
                'Great choice. Caiden focused on what needed to happen first.',
              feedbackIncorrect:
                'Try again. The Camp Challenge starts soon, so Caiden should prepare what he needs.',
              lockInTipsCorrect: DEMO_LOCK_IN_TIP.tips,
              lockInTipsIncorrect: [
                'Ask: what has a deadline coming up first?',
                'Pick the task tied to the Camp Challenge.',
                'Try one small prep step and check again.',
              ],
            },
          })}
        />
      ) : (
        <GameCoachingRailPlaceholder variant="b4" />
      )}

      <h3 className="dsPageSectionSub">Variant: B4_PARENT_COACH</h3>
      <p className="dsPageNote">Single coaching voice for family — replaces &quot;Parent Mentor Says&quot;.</p>
      <LearningMomentCard variant="B4_PARENT_COACH" {...DEMO_B4_PARENT_COACH} />

      <h3 className="dsPageSectionSub">Variant: FACILITATOR_INSIGHT</h3>
      <p className="dsPageNote">{LEARNING_MOMENT_VARIANTS.FACILITATOR_INSIGHT.usage.join(' · ')}</p>
      <LearningMomentCard
        variant="FACILITATOR_INSIGHT"
        headline={DEMO_EXPERT_INSIGHT.insight}
        whyItMatters={DEMO_EXPERT_INSIGHT.whyItMatters}
        tryThis={DEMO_EXPERT_INSIGHT.tryThis}
        watchFor={DEMO_EXPERT_INSIGHT.watchFor}
      />

      <h3 className="dsPageSectionSub">GameShell + QuestionCard (kid rhythm)</h3>
      <GameShell
        portalType="kid"
        gameTitle="Caiden's Focus Quest"
        participantName="Alex"
        progress={42}
        backLabel="Focus Flame Journey"
        footerSlot={
          <button type="button" className="dsBtnGold" disabled={!kidChecked}>
            Continue
          </button>
        }
        lockInTipSlot={kidChecked ? <LearningMomentCard {...DEMO_LOCK_IN_TIP} /> : null}
      >
        <QuestionCard
          characterId="caiden"
          sceneLabel={DEMO_GAME_QUESTION.sceneLabel}
          tag={DEMO_GAME_QUESTION.tag}
          storyPrompt={DEMO_GAME_QUESTION.storyPrompt}
        />
        <h4 className="dsGameDemoPrompt">{DEMO_GAME_QUESTION.prompt}</h4>
        <AnswerChoiceList
          options={DEMO_GAME_OPTIONS}
          selectedId={kidSelected}
          correctId={kidCorrectId}
          checked={kidChecked}
          onSelect={(id) => {
            setKidSelected(id);
            setKidChecked(true);
          }}
        />
      </GameShell>
      <p className="dsPageNote">
        Kid rhythm: question → answer → correct/incorrect → LearningMomentCard → Continue.
      </p>
      <div className="dsPageRow">
        <button
          type="button"
          className="dsBtnGhost"
          onClick={() => {
            setKidSelected(null);
            setKidChecked(false);
          }}
        >
          Reset kid demo
        </button>
      </div>

      <h3 className="dsPageSectionSub">Facilitator GameShell — B-4 coaching rail (before / after)</h3>
      <p className="dsPageNote">
        Matches live facilitator games: left game column + 280–360px B-4 rail, 32px gap. B-4 fills on
        answer selection via <code>getB4LockInTip</code> (portalType=facilitator).
      </p>
      <div className="mission-quizLayout mission-quizLayout--coachingRail mission-quizLayout--hasMission">
        <div className="mission-quizLayoutMission">
          <QuestionCard
            characterId="caiden"
            sceneLabel="Mission Card"
            tag="GETTING STARTED"
            storyPrompt={DEMO_GAME_QUESTION.storyPrompt}
          />
        </div>
        <div className="mission-quizLayoutLearning">
          <h4 className="dsGameDemoPrompt">{DEMO_GAME_QUESTION.prompt}</h4>
          <AnswerChoiceList
            options={DEMO_GAME_OPTIONS}
            selectedId={kidSelected}
            correctId={kidCorrectId}
            checked={kidChecked}
            onSelect={(id) => {
              setKidSelected(id);
              setKidChecked(false);
            }}
          />
        </div>
        <aside className="mission-quizLayoutAside">
          <div className="mission-quizLayoutAsideInner">
            {kidSelected ? (
              <LearningMomentCard
                {...getB4LockInTip({
                  portalType: 'facilitator',
                  gameId: 'quest-1',
                  moduleId: 'quest-1',
                  questionId: 'cq1-q1',
                  selectedAnswer: kidSelected,
                  isCorrect: kidSelected === kidCorrectId,
                  skillArea: 'focus',
                  characterId: 'caiden',
                  learningGoal: 'GETTING STARTED',
                  question: CAIDEN_QUEST_1_CONFIG.questions[0],
                })}
                showRailChevron
              />
            ) : (
              <GameCoachingRailPlaceholder variant="b4" />
            )}
          </div>
        </aside>
      </div>

      <h3 className="dsPageSectionSub">Facilitator GameShell — Dr. Victoria adult training rail</h3>
      <p className="dsPageNote">
        Adult training uses FACILITATOR_INSIGHT in the right rail after Check. No duplicate bottom
        explanation card.
      </p>
      <div className="mission-quizLayout mission-quizLayout--coachingRail">
        <div className="mission-quizLayoutMain">
          <QuestionCard
            characterId="dr-victoria"
            sceneLabel="Reflection Card"
            tag={`Question ${adultQuestionIndex + 1}`}
            storyPrompt="A student shuts down after a peer laughs at their answer."
          />
          <h4 className="dsGameDemoPrompt">What is the strongest first move?</h4>
          <AnswerChoiceList
            options={DEMO_GAME_OPTIONS}
            selectedId={adultSelected}
            correctId={adultCorrectId}
            checked={adultChecked}
            onSelect={(id) => {
              setAdultSelected(id);
              setAdultChecked(true);
            }}
          />
        </div>
        <div className="mission-quizLayoutAside">
          {adultChecked ? (
            <LearningMomentCard
              variant="FACILITATOR_INSIGHT"
              headline={DEMO_EXPERT_INSIGHT.insight}
              whyItMatters={DEMO_EXPERT_INSIGHT.whyItMatters}
              tryThis={DEMO_EXPERT_INSIGHT.tryThis}
              watchFor={DEMO_EXPERT_INSIGHT.watchFor}
            />
          ) : (
            <GameCoachingRailPlaceholder variant="facilitator" />
          )}
        </div>
      </div>
      <div className="dsPageRow">
        <button
          type="button"
          className="dsBtnGhost"
          onClick={() => setAdultQuestionIndex((n) => (n + 1) % 6)}
        >
          Next reflection point (Q{(adultQuestionIndex + 1) % 6 || 6})
        </button>
        <button
          type="button"
          className="dsBtnGhost"
          onClick={() => {
            setAdultSelected(null);
            setAdultChecked(false);
          }}
        >
          Reset adult demo
        </button>
      </div>

      <h3 className="dsPageSectionSub">Family coaching (B-4 Parent Coach)</h3>
      <LearningMomentCard
        variant="B4_PARENT_COACH"
        headline={DEMO_FAMILY_LOCK_IN.message}
        tryThis={DEMO_FAMILY_LOCK_IN.tips}
        whyItMatters="Small home practices help kids transfer focus skills from camp to daily life."
        watchFor="Rushing to fix the feeling before your child feels heard."
      />

      <h3 className="dsPageSectionSub">AI-ready fields (future)</h3>
      <p className="dsPageNote">
        Props supported without UI changes: title, headline, body, whyItMatters, tryThis, watchFor,
        avatarType, variant — mapped from {LEARNING_MOMENT_CARD_REGISTRY.aiFields.join(', ')}.
      </p>
    </section>
  );
}
