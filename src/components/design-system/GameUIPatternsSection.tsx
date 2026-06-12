import React from 'react';
import {
  GAME_UI_PATTERNS,
  caidenFocusMissionPattern,
  mirandaMysteryFilePattern,
} from '../../design-system/game/patterns/gameUIPatterns';
import GuideFeedbackCard from '../../design-system/game/GuideFeedbackCard';
import GameInteractionShell from '../game-assessment/shared/GameInteractionShell';
import PortalBreadcrumb from '../portal/PortalBreadcrumb';

export default function GameUIPatternsSection() {
  return (
    <section id="game-ui-patterns" className="dsSection">
      <h2 className="dsSectionTitle">Game UI Patterns</h2>
      <p className="dsSectionIntro">
        Choose <strong>GameInteractionShell</strong> + a character pattern config + question data.
        Patterns swap visual tokens only — scoring and Supabase saves stay unchanged.
      </p>

      <div className="dsSubsection" id="portal-breadcrumb">
        <h3 className="dsSubsectionTitle">Portal Breadcrumb</h3>
        <p className="dsSectionIntro">
          Use when a user moves one level deeper into a character dashboard, game, resource,
          assessment, or settings detail screen. Always returns one logical level up in the current
          portal context — never centered, never duplicated with an oversized close button.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
          <PortalBreadcrumb
            label="Back to Character Hub"
            href="#portal-breadcrumb"
            variant="dashboard"
          />
          <PortalBreadcrumb
            label="Back to Focus Flame Journey"
            href="#portal-breadcrumb"
            theme="caiden"
            variant="game"
          />
          <PortalBreadcrumb
            label="Back to Activities Library"
            href="#portal-breadcrumb"
            variant="game"
          />
        </div>
      </div>

      <div className="dsSubsection" id="character-dashboard-layout">
        <h3 className="dsSubsectionTitle">Character Dashboard Layout</h3>
        <p className="dsSectionIntro">
          Standard workspace layout for character dashboards: <strong>PortalBreadcrumb</strong>,{' '}
          <strong>CharacterHeroCard</strong>, <strong>QuestGrid</strong>, and{' '}
          <strong>MissionCoachCard</strong>. Left-aligned — never a centered marketing hero.
        </p>
        <ul className="dsSectionIntro">
          <li>
            <strong>CharacterDashboardLayout</strong> — shell + breadcrumb inset matches gameplay
            header (0.75rem × 1rem)
          </li>
          <li>
            <strong>CharacterHeroCard</strong> — horizontal hero: image left, copy right
          </li>
          <li>
            <strong>QuestGrid</strong> — 2-column quest cards on desktop, stacked on mobile
          </li>
          <li>
            <strong>MissionCoachCard</strong> — sticky B-4 coach rail on desktop; compact between hero
            and quests on mobile
          </li>
        </ul>
      </div>

      <div className="dsSubsection">
        <h3 className="dsSubsectionTitle">Character pattern configs</h3>
        <ul className="dsSectionIntro">
          {Object.values(GAME_UI_PATTERNS).map((pattern) => (
            <li key={pattern.id}>
              <strong>{pattern.themeName}</strong> — {pattern.guideLabel} · accent{' '}
              <span style={{ color: pattern.primaryAccent }}>{pattern.primaryAccent}</span> · CTA{' '}
              &ldquo;{pattern.missionCtaLabel}&rdquo;
            </li>
          ))}
        </ul>
      </div>

      <div className="dsSubsection">
        <h3 className="dsSubsectionTitle">Shared Game Shell (Caiden Focus Mission)</h3>
        <GameInteractionShell patternId={caidenFocusMissionPattern.id} usePlayLayout>
          <div className="game-interactionShellLayout game-interactionShellLayout--play">
            <div className="game-interactionShellLayoutStory">
              <div className="mission-scenarioCard">Focus mission context card</div>
            </div>
            <div className="game-interactionShellLayoutQuestion">
              <h2 className="mission-questionText">What should Caiden do first?</h2>
            </div>
            <div className="game-interactionShellLayoutAnswers">
              <button type="button" className="bbc-answerCard bbc-answerCard--selected">
                Pack lunch
              </button>
            </div>
            <div className="game-interactionShellLayoutFeedback">
              <GuideFeedbackCard
                tone="success"
                learningMoment={{
                  variant: 'B4_LOCK_IN',
                  title: 'B-4 Coach',
                  headline: 'Nice focus move!',
                  body: 'Starting with one step keeps the mission clear.',
                }}
                showContinue
                onContinue={() => undefined}
              />
            </div>
          </div>
        </GameInteractionShell>
      </div>

      <div className="dsSubsection">
        <h3 className="dsSubsectionTitle">Miranda Mystery File pattern</h3>
        <GameInteractionShell patternId={mirandaMysteryFilePattern.id}>
          <p className="dsSectionIntro">
            Purple clue styling stays separate from Caiden academy cards — use{' '}
            <code>miranda-mystery-file</code> pattern only for Mystery Files.
          </p>
        </GameInteractionShell>
      </div>
    </section>
  );
}
