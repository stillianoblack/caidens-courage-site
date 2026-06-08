import React from 'react';
import type { VictoriaFocusLabAccent } from '../../types/gameAssessment';
import VictoriaFocusLabGraphic from './VictoriaFocusLabGraphic';

type VictoriaFocusLabCardProps = {
  label: string;
  tag: string;
  text: string;
  accent?: VictoriaFocusLabAccent;
};

export default function VictoriaFocusLabCard({ label, tag, text, accent }: VictoriaFocusLabCardProps) {
  return (
    <article className="victoria-focusLabCard mission-scenarioCard">
      <div className="mission-scenarioCardHead victoria-focusLabCardHead">
        <span className="mission-scenarioCardLabel victoria-focusLabCardLabel">{label}</span>
        <span className="mission-scenarioCardTag victoria-focusLabCardTag">{tag}</span>
      </div>
      <div className="mission-scenarioCardBody">
        <div className="mission-scenarioIllustration">
          <VictoriaFocusLabGraphic accent={accent} />
        </div>
        <p className="mission-scenarioText victoria-focusLabCardText">{text}</p>
      </div>
    </article>
  );
}

export function questionHasVictoriaFocusLabGraphic(question: { clueCard?: { variant?: string } }): boolean {
  return question.clueCard?.variant === 'focus_lab';
}
