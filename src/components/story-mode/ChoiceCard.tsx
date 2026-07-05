import React from 'react';
import type { StoryChoice } from '../../data/storyMode';

type ChoiceCardProps = {
  choice: StoryChoice;
  selectedOption?: string;
  onSelect: (option: string) => void;
  onContinue: () => void;
};

export default function ChoiceCard({
  choice,
  selectedOption,
  onSelect,
  onContinue,
}: ChoiceCardProps) {
  return (
    <article className="storyChoiceCard">
      <span>Choice</span>
      <h2>{choice.prompt}</h2>
      <div className="storyChoiceCard__options" role="group" aria-label={choice.prompt}>
        {choice.options.slice(0, 4).map((option) => (
          <button
            type="button"
            key={option}
            className={selectedOption === option ? 'storyChoiceCard__option--selected' : ''}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <button type="button" onClick={onContinue} disabled={!selectedOption}>
        Continue Journey
      </button>
    </article>
  );
}
