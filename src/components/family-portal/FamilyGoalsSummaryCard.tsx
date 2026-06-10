import React from 'react';
import { openProgramGoals } from '../../lib/openProgramGoals';
import StatusChip from '../portal-design-system/StatusChip';

type FamilyGoalsSummaryCardProps = {
  goals: string[];
  className?: string;
};

export default function FamilyGoalsSummaryCard({ goals, className = '' }: FamilyGoalsSummaryCardProps) {
  const hasGoals = goals.length > 0;

  return (
    <section className={`family-goalsSummaryCard${className ? ` ${className}` : ''}`}>
      <div className="family-goalsSummaryHead">
        <h2 className="family-panelBlockTitle">Family Goals</h2>
        {hasGoals ? (
          <span className="family-goalsSummaryCount">{goals.length} selected</span>
        ) : null}
      </div>
      {hasGoals ? (
        <ul className="family-goalsSummaryChips">
          {goals.map((goal) => (
            <li key={goal}>
              <StatusChip label={goal} variant="default" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="family-goalsSummaryEmpty">
          Choose goals so B-4 can recommend better activities.
        </p>
      )}
      <button type="button" className="family-goalsSummaryCta" onClick={() => openProgramGoals()}>
        {hasGoals ? 'Update Goals' : 'Set Family Goals'}
      </button>
    </section>
  );
}
