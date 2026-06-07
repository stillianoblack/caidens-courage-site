import React from 'react';
import type { CaidenQuestAccent } from '../../types/gameAssessment';
import CaidenQuestGraphic from './CaidenQuestGraphic';

type CaidenQuestCardProps = {
  label: string;
  tag: string;
  text: string;
  accent?: CaidenQuestAccent;
};

export default function CaidenQuestCard({ label, tag, text, accent }: CaidenQuestCardProps) {
  return (
    <article className="caiden-questCard">
      <div className="caiden-questCardHead">
        <span className="caiden-questCardLabel">{label}</span>
        <span className="caiden-questCardTag">{tag}</span>
      </div>
      <CaidenQuestGraphic accent={accent} />
      <p className="caiden-questCardText">{text}</p>
    </article>
  );
}

export function questionHasCaidenQuestGraphic(question: { clueCard?: { variant?: string } }): boolean {
  return question.clueCard?.variant === 'focus_quest';
}
