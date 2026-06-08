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
    <article className="caiden-questCard mission-scenarioCard">
      <div className="mission-scenarioCardHead caiden-questCardHead">
        <span className="mission-scenarioCardLabel caiden-questCardLabel">{label}</span>
        <span className="mission-scenarioCardTag caiden-questCardTag">{tag}</span>
      </div>
      <div className="mission-scenarioCardBody">
        <div className="mission-scenarioIllustration">
          <CaidenQuestGraphic accent={accent} />
        </div>
        <p className="mission-scenarioText caiden-questCardText">{text}</p>
      </div>
    </article>
  );
}

export function questionHasCaidenQuestGraphic(question: { clueCard?: { variant?: string } }): boolean {
  return question.clueCard?.variant === 'focus_quest';
}
