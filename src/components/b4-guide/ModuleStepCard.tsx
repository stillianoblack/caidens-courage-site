import React from 'react';
import type { B4GuideModuleStep } from '../../data/b4GuideContent';
import AnswerButton from './AnswerButton';
import B4Dialogue from './B4Dialogue';
import ProgressBar from './ProgressBar';

type ModuleStepCardProps = {
  step: B4GuideModuleStep;
  stepIndex: number;
  totalSteps: number;
  selectedChoiceId?: string;
  instruction?: string | null;
  onSelect: (choiceId: string) => void;
  onContinue?: () => void;
};

export default function ModuleStepCard({
  step,
  stepIndex,
  totalSteps,
  selectedChoiceId,
  instruction,
  onSelect,
  onContinue,
}: ModuleStepCardProps) {
  const isFocusMove = step.kind === 'focus-move';
  const showInstruction = isFocusMove && selectedChoiceId && instruction;

  return (
    <div className="b4g-card">
      <ProgressBar
        current={stepIndex + 1}
        total={totalSteps}
        label={`Step ${stepIndex + 1} of ${totalSteps}`}
      />
      <p className="b4g-step-label">{step.title}</p>
      {step.b4Intro ? <B4Dialogue message={step.b4Intro} /> : null}
      {step.prompt ? (
        <p className="b4g-question-prompt" id="b4g-module-prompt">
          {step.prompt}
        </p>
      ) : null}
      <div
        className="b4g-answers"
        role="group"
        aria-labelledby={step.prompt ? 'b4g-module-prompt' : undefined}
        aria-label={step.prompt ? undefined : step.title}
      >
        {step.choices.map((choice) => (
          <AnswerButton
            key={choice.id}
            label={choice.label}
            selected={selectedChoiceId === choice.id}
            onClick={() => onSelect(choice.id)}
          />
        ))}
      </div>
      {showInstruction ? (
        <div className="b4g-instruction-card" role="status">
          <p className="b4g-step-label">Try it now</p>
          <p>{instruction}</p>
        </div>
      ) : null}
      {showInstruction && onContinue ? (
        <div className="b4g-actions">
          <button type="button" className="b4g-primary-btn" onClick={onContinue}>
            Continue
          </button>
        </div>
      ) : null}
    </div>
  );
}
