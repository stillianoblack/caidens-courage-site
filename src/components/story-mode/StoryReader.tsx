import React from 'react';
import type { StoryComicPanel } from '../../data/storyMode';

type StoryReaderProps = {
  panel: StoryComicPanel;
  currentStep: number;
  totalSteps: number;
  onContinue: () => void;
  continueLabel?: string;
};

export default function StoryReader({
  panel,
  currentStep,
  totalSteps,
  onContinue,
  continueLabel = 'Step Forward',
}: StoryReaderProps) {
  return (
    <article className="storyReader">
      <div className="storyReader__media">
        <img src={panel.image} alt={panel.alt} />
      </div>
      <div className="storyReader__copy">
        <span>
          Scene {currentStep} of {totalSteps}
        </span>
        <p>{panel.narration}</p>
        <button type="button" onClick={onContinue}>
          {continueLabel}
        </button>
      </div>
    </article>
  );
}
