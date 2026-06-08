import React from 'react';
import type { UncleTCoachingAccent } from '../../types/gameAssessment';
import UncleTScenarioIllustration from './UncleTScenarioIllustration';

type UncleTCoachingCardProps = {
  label: string;
  tag: string;
  text: string;
  accent?: UncleTCoachingAccent;
};

export default function UncleTCoachingCard({ label, tag, text, accent }: UncleTCoachingCardProps) {
  return (
    <article className="uncleT-coachingCard mission-scenarioCard">
      <div className="mission-scenarioCardHead uncleT-coachingCardHead">
        <span className="mission-scenarioCardLabel uncleT-coachingCardLabel">{label}</span>
        <span className="mission-scenarioCardTag uncleT-coachingCardTag">{tag}</span>
      </div>
      <div className="mission-scenarioCardBody">
        <div className="mission-scenarioIllustration">
          <UncleTScenarioIllustration accent={accent} />
        </div>
        <p className="mission-scenarioText uncleT-coachingCardText">{text}</p>
      </div>
    </article>
  );
}

export function questionHasUncleTCoachingGraphic(question: { clueCard?: { variant?: string } }): boolean {
  return question.clueCard?.variant === 'coaching_card';
}
