import React from 'react';
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
  onSelect: (choiceId: string) => void;
};

export default function QuestionCard({
  prompt,
  b4Intro,
  choices,
  current,
  total,
  progressLabel,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="b4g-card">
      <ProgressBar current={current} total={total} label={progressLabel} />
      {b4Intro ? <B4Dialogue message={b4Intro} /> : null}
      <p className="b4g-question-prompt" id="b4g-question-prompt">
        {prompt}
      </p>
      <div className="b4g-answers" role="group" aria-labelledby="b4g-question-prompt">
        {choices.map((choice) => (
          <AnswerButton key={choice.id} label={choice.label} onClick={() => onSelect(choice.id)} />
        ))}
      </div>
    </div>
  );
}
