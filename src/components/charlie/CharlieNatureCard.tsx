import React from 'react';
import type { CharlieNatureAccent } from '../../types/gameAssessment';
import CharlieNatureIllustration from './CharlieNatureIllustration';
import './charlie-nature-illustration.css';

type CharlieNatureCardProps = {
  label: string;
  tag: string;
  text: string;
  accent?: CharlieNatureAccent;
};

export default function CharlieNatureCard({ label, tag, text, accent }: CharlieNatureCardProps) {
  return (
    <article className="charlie-natureCard mission-scenarioCard">
      <div className="mission-scenarioCardHead charlie-natureCardHead">
        <span className="mission-scenarioCardLabel charlie-natureCardLabel">{label}</span>
        <span className="mission-scenarioCardTag charlie-natureCardTag">{tag}</span>
      </div>
      <div className="mission-scenarioCardBody">
        <div className="mission-scenarioIllustration">
          <CharlieNatureIllustration accent={accent} />
        </div>
        <p className="mission-scenarioText charlie-natureCardText">{text}</p>
      </div>
    </article>
  );
}

export function questionHasCharlieNatureGraphic(question: { clueCard?: { variant?: string } }): boolean {
  return question.clueCard?.variant === 'nature_card';
}
