import React from 'react';
import CheckButton from '../../design-system/game/CheckButton';
import type { B4GuideChoice } from '../../data/b4GuideContent';
import AnswerButton from './AnswerButton';
import B4Dialogue from './B4Dialogue';
import ProgressBar from './ProgressBar';

type QuestionCardProps = {
  prompt: string;
  b4Intro?: string;
  choices: B4GuideChoice[];
  current: number;
  total: number;
  progressLabel: string;
  selectedId?: string | null;
  checked?: boolean;
  onSelect: (choiceId: string) => void;
  onCheck?: () => void;
  onContinue?: () => void;
};

export default function QuestionCard({
  prompt,
  b4Intro,
  choices,
  current,
  total,
  progressLabel,
  selectedId = null,
  checked = false,
  onSelect,
  onCheck,
  onContinue,
}: QuestionCardProps) {
  const useCommitFlow = Boolean(onCheck);

  return (
    <div className="b4g-card">
      <ProgressBar current={current} total={total} label={progressLabel} />
      {b4Intro ? <B4Dialogue message={b4Intro} /> : null}
      {!checked && useCommitFlow ? (
        <B4Dialogue message="Choose your answer, then press Check." />
      ) : null}
      <p className="b4g-question-prompt" id="b4g-question-prompt">
        {prompt}
      </p>
      <div className="b4g-answers" role="group" aria-labelledby="b4g-question-prompt">
        {choices.map((choice) => {
          const isSelected = selectedId === choice.id;
          if (useCommitFlow) {
            return (
              <button
                key={choice.id}
                type="button"
                className={[
                  'b4g-answer-btn',
                  isSelected ? 'b4g-answer-btn--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={checked}
                aria-pressed={isSelected}
                onClick={() => onSelect(choice.id)}
              >
                {choice.label}
              </button>
            );
          }
          return (
            <AnswerButton key={choice.id} label={choice.label} onClick={() => onSelect(choice.id)} />
          );
        })}
      </div>
      {useCommitFlow ? (
        <div className="b4g-questionActions">
          {!checked ? (
            <CheckButton disabled={!selectedId} onClick={onCheck!} />
          ) : (
            <CheckButton label="Continue" className="bbc-checkBtn--continue" onClick={onContinue!} />
          )}
        </div>
      ) : null}
    </div>
  );
}
