import React, { useState } from 'react';
import {
  AnswerChoiceList,
  GameShell,
  LearningMomentCard,
  QuestionCard,
  getArchetypeProfile,
  LEARNING_MOMENT_CARD_REGISTRY,
  LEARNING_MOMENT_VARIANTS,
} from '../../design-system';
import {
  DEMO_B4_PARENT_COACH,
  DEMO_CHARACTER_SAMPLES,
  DEMO_EXPERT_INSIGHT,
  DEMO_FAMILY_LOCK_IN,
  DEMO_GAME_OPTIONS,
  DEMO_GAME_QUESTION,
  DEMO_LOCK_IN_TIP,
} from '../../data/designSystemGameDemoData';
import '../../design-system/game/game-learning.css';

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
      <LearningMomentCard
        variant="B4_LOCK_IN"
        headline={DEMO_LOCK_IN_TIP.message}
        tips={DEMO_LOCK_IN_TIP.tips}
      />

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
        lockInTipSlot={
          kidChecked ? (
            <LearningMomentCard
              variant="B4_LOCK_IN"
              headline={DEMO_LOCK_IN_TIP.message}
              tips={DEMO_LOCK_IN_TIP.tips}
            />
          ) : null
        }
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

      <h3 className="dsPageSectionSub">Facilitator rhythm (mock)</h3>
      <p className="dsPageNote">
        B4_LOCK_IN after each answer; FACILITATOR_INSIGHT every 3rd question. Legacy bottom panels
        hidden.
      </p>
      <div className="mission-quizLayout mission-quizLayout--lockIn">
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
        {adultChecked ? (
          <div className="mission-quizLayoutAside">
            <LearningMomentCard
              variant="B4_LOCK_IN"
              headline="Quick coaching: connect before you correct."
              tips={['Validate the feeling in one sentence.', 'Offer one small next step.']}
            />
            {(adultQuestionIndex + 1) % 3 === 0 ? (
              <LearningMomentCard
                variant="FACILITATOR_INSIGHT"
                headline={DEMO_EXPERT_INSIGHT.insight}
                whyItMatters={DEMO_EXPERT_INSIGHT.whyItMatters}
                tryThis={DEMO_EXPERT_INSIGHT.tryThis}
                watchFor={DEMO_EXPERT_INSIGHT.watchFor}
              />
            ) : null}
          </div>
        ) : null}
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
