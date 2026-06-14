import React from 'react';
import CheckButton from './CheckButton';
import ExplainMoreButton from './ExplainMoreButton';
import HintButton from './HintButton';
import LearningMomentCard, { type LearningMomentCardProps } from './LearningMomentCard';

export type GuideFeedbackTone = 'success' | 'incorrect' | 'neutral' | 'hint';

export type GuideFeedbackCardProps = {
  tone: GuideFeedbackTone;
  learningMoment: LearningMomentCardProps;
  showContinue?: boolean;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  showTryAgain?: boolean;
  onTryAgain?: () => void;
  showHint?: boolean;
  onHint?: () => void;
  showExplainMore?: boolean;
  onToggleExplainMore?: () => void;
  canExplainMore?: boolean;
  className?: string;
};

/**
 * Shared guide feedback card — lighter header, short copy, actions attached to card footer.
 */
export default function GuideFeedbackCard({
  tone,
  learningMoment,
  showContinue = false,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  showTryAgain = false,
  onTryAgain,
  showHint = false,
  onHint,
  showExplainMore = false,
  onToggleExplainMore,
  canExplainMore = false,
  className = '',
}: GuideFeedbackCardProps) {
  const toneClass =
    tone === 'success'
      ? 'ds-guideFeedback--success'
      : tone === 'incorrect'
        ? 'ds-guideFeedback--incorrect'
        : tone === 'hint'
          ? 'ds-guideFeedback--hint'
          : 'ds-guideFeedback--neutral';

  return (
    <div className={['ds-guideFeedback', toneClass, className].filter(Boolean).join(' ')}>
      <LearningMomentCard {...learningMoment} className="ds-guideFeedbackCard" />
      <div className="ds-guideFeedbackActions">
        {showTryAgain && onTryAgain ? (
          <button type="button" className="ds-guideFeedbackTryAgain" onClick={onTryAgain}>
            Try Again
          </button>
        ) : null}
        {showHint && onHint ? <HintButton onClick={onHint} /> : null}
        {canExplainMore && onToggleExplainMore ? (
          <ExplainMoreButton expanded={showExplainMore} onClick={onToggleExplainMore} />
        ) : null}
        {showContinue && onContinue ? (
          <CheckButton
            label={continueLabel}
            className="bbc-checkBtn--continue"
            onClick={onContinue}
            disabled={continueDisabled}
          />
        ) : null}
      </div>
    </div>
  );
}
