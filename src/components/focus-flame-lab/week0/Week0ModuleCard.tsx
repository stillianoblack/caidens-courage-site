import React from 'react';

type Week0ModuleCardProps = {
  title: string;
  description: string;
  questionCount: number;
  typeLabel: string;
  complete: boolean;
  onStart: () => void;
};

export default function Week0ModuleCard({
  title,
  description,
  questionCount,
  typeLabel,
  complete,
  onStart,
}: Week0ModuleCardProps) {
  return (
    <button
      type="button"
      className={`ffl-week0-moduleCard${complete ? ' ffl-week0-moduleCard--complete' : ''}`}
      onClick={onStart}
      aria-label={`${title}. ${complete ? 'Completed.' : 'Not started.'} ${questionCount} questions. ${typeLabel}.`}
    >
      <div className="ffl-week0-moduleCard-head">
        <div>
          <div className="ffl-week0-moduleCard-title">{title}</div>
          <div className="ffl-week0-moduleCard-meta">
            {questionCount} questions · {typeLabel}
          </div>
        </div>
        {complete ? (
          <span className="ffl-week0-moduleCard-check" aria-hidden="true">
            ✓
          </span>
        ) : null}
      </div>
      <p className="ffl-week0-moduleCard-desc">{description}</p>
      <span className="ffl-week0-moduleCard-cta">{complete ? 'Review again' : 'Start module'}</span>
    </button>
  );
}
