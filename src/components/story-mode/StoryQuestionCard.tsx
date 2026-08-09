import React from 'react';
import type { StoryQuestionVariant, StoryQuestQuestion } from '../../data/storyMode';

type Props = {
  question: StoryQuestQuestion;
  variant: StoryQuestionVariant;
  questionNumber: number;
  selectedAnswer: string | null;
  attempts: number;
  feedback: 'correct' | 'hint' | null;
  sparkCount: number;
  totalSparks: number;
  onSelect: (answer: string) => void;
  onContinue: () => void;
  continueLabel?: string;
};

export default function StoryQuestionCard({
  question,
  variant,
  questionNumber,
  selectedAnswer,
  attempts,
  feedback,
  sparkCount,
  totalSparks,
  onSelect,
  onContinue,
  continueLabel = 'Next Question',
}: Props) {
  const visibleSparkCount = Math.min(sparkCount, totalSparks);
  const shuffledAnswers = React.useMemo(() => {
    const items = [...variant.answers];
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }
    return items;
  }, [variant.answers]);

  return (
    <section className="storyQuestionCard" aria-labelledby={`${question.id}-prompt`}>
      <div className="storyQuestionCard__meta">
        <span>Question {questionNumber} of {totalSparks}</span>
        <strong aria-label={`${visibleSparkCount} of ${totalSparks} Story Sparks`}>🔥 {visibleSparkCount} / {totalSparks} Story Sparks</strong>
      </div>
      <h2 id={`${question.id}-prompt`}>{variant.prompt}</h2>
      <div className="storyQuestionCard__answers" role="group" aria-label="Choose your answer">
        {shuffledAnswers.map((answer) => (
          <button
            key={answer}
            type="button"
            className={selectedAnswer === answer
              ? feedback === 'hint'
                ? 'is-selected is-incorrect'
                : feedback === 'correct'
                  ? 'is-selected is-correct'
                  : 'is-selected'
              : ''}
            onClick={() => onSelect(answer)}
            disabled={feedback === 'correct'}
          >
            {answer}
          </button>
        ))}
      </div>
      {feedback === 'hint' ? (
        <div className="storyQuestionCard__feedback storyQuestionCard__feedback--hint" role="status">
          <img src="/images/Choose-Your-Guide/B-4student.webp" alt="" />
          <strong>B-4 Hint</strong>
          <p>{variant.hint}</p>
          <small>Take another look and choose again. Attempts: {attempts}</small>
        </div>
      ) : null}
      {feedback === 'correct' ? (
        <div className="storyQuestionCard__feedback storyQuestionCard__feedback--spark" role="status">
          <img src="/images/Choose-Your-Guide/B-4student.webp" alt="" />
          <strong>B-4</strong>
          <p>{variant.b4Feedback}</p>
          <button type="button" onClick={onContinue}>{continueLabel}</button>
        </div>
      ) : null}
    </section>
  );
}
