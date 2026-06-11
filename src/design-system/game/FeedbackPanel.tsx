import React from 'react';
import ExplainMoreButton from './ExplainMoreButton';

export type FeedbackPanelProps = {
  tone: 'success' | 'try' | 'neutral';
  message: string;
  hint?: string | null;
  explainMore?: string;
  showExplainMore?: boolean;
  onToggleExplainMore?: () => void;
  canExplainMore?: boolean;
  className?: string;
};

export default function FeedbackPanel({
  tone,
  message,
  hint,
  explainMore,
  showExplainMore = false,
  onToggleExplainMore,
  canExplainMore = false,
  className = '',
}: FeedbackPanelProps) {
  return (
    <div
      className={[
        'ds-feedbackPanel',
        tone === 'success' ? 'ds-feedbackPanel--success' : '',
        tone === 'try' ? 'ds-feedbackPanel--try' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
    >
      <p className="ds-feedbackPanelMessage">{message}</p>
      {hint ? (
        <p className="ds-feedbackPanelHint">
          <span className="ds-feedbackPanelHintLabel">Hint:</span> {hint}
        </p>
      ) : null}
      {canExplainMore && onToggleExplainMore ? (
        <div className="ds-feedbackPanelActions">
          <ExplainMoreButton expanded={showExplainMore} onClick={onToggleExplainMore} />
        </div>
      ) : null}
      {showExplainMore && explainMore ? (
        <p className="ds-feedbackPanelExplain">{explainMore}</p>
      ) : null}
    </div>
  );
}
