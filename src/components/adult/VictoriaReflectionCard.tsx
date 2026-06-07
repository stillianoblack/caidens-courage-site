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
    <article className="victoria-reflectionCard">
      <div className="victoria-reflectionCardHead">
        <span className="victoria-reflectionCardLabel">{label}</span>
        <span className="victoria-reflectionCardTag">{tag}</span>
      </div>
      <VictoriaReflectionGraphic accent={accent} />
      <p className="victoria-reflectionCardText">{text}</p>
    </article>
  );
}

export function questionHasVictoriaReflectionGraphic(question: { clueCard?: { variant?: string } }): boolean {
  return question.clueCard?.variant === 'reflection_card';
}
