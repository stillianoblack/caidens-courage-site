import React from 'react';
import type { VictoriaReflectionAccent } from '../../types/gameAssessment';
import VictoriaReflectionGraphic from './VictoriaReflectionGraphic';

type VictoriaReflectionCardProps = {
  label: string;
  tag: string;
  text: string;
  accent?: VictoriaReflectionAccent;
};

export default function VictoriaReflectionCard({ label, tag, text, accent }: VictoriaReflectionCardProps) {
  return (
    <article className="victoria-reflectionCard mission-scenarioCard">
      <div className="mission-scenarioCardHead victoria-reflectionCardHead">
        <span className="mission-scenarioCardLabel victoria-reflectionCardLabel">{label}</span>
        <span className="mission-scenarioCardTag victoria-reflectionCardTag">{tag}</span>
      </div>
      <div className="mission-scenarioCardBody">
        <div className="mission-scenarioIllustration">
          <VictoriaReflectionGraphic accent={accent} />
        </div>
        <p className="mission-scenarioText victoria-reflectionCardText">{text}</p>
      </div>
    </article>
  );
}

export function questionHasVictoriaReflectionGraphic(question: { clueCard?: { variant?: string } }): boolean {
  return question.clueCard?.variant === 'reflection_card';
}
