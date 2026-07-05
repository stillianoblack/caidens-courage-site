import React from 'react';
import type { StoryDialogueLine } from '../../data/storyMode';

type DialogueCardProps = {
  line: StoryDialogueLine;
  onContinue: () => void;
  continueLabel?: string;
};

export default function DialogueCard({
  line,
  onContinue,
  continueLabel = 'Step Forward',
}: DialogueCardProps) {
  return (
    <article className="storyDialogueCard">
      <img src={line.portrait} alt="" />
      <div>
        <span>{line.characterName}</span>
        <p>{line.text}</p>
        <button type="button" onClick={onContinue}>
          {continueLabel}
        </button>
      </div>
    </article>
  );
}
