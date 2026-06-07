import React from 'react';

type B4BaselineBottomBarProps = {
  canCheck: boolean;
  checked: boolean;
  feedback?: string | null;
  feedbackTone?: 'success' | 'try' | 'neutral';
  onSkip: () => void;
  onCheck: () => void;
  onContinue: () => void;
};

export default function B4BaselineBottomBar({
  canCheck,
  checked,
  feedback,
  feedbackTone = 'neutral',
  onSkip,
  onCheck,
  onContinue,
}: B4BaselineBottomBarProps) {
  const barClass = [
    'bbc-bottomBar',
    checked && feedbackTone === 'success' ? 'bbc-bottomBar--success' : '',
    checked && feedbackTone === 'try' ? 'bbc-bottomBar--try' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <footer className={barClass}>
      <div className="bbc-bottomBarInner">
        {!checked ? (
          <>
            <button type="button" className="bbc-skipBtn" onClick={onSkip}>
              Skip
            </button>
            <button type="button" className="bbc-checkBtn" disabled={!canCheck} onClick={onCheck}>
              Check
            </button>
          </>
        ) : (
          <>
            {feedback ? (
              <p className="bbc-feedbackBanner" role="status">
                {feedback}
              </p>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="bbc-checkBtn bbc-checkBtn--continue"
              onClick={onContinue}
            >
              Continue
            </button>
          </>
        )}
      </div>
    </footer>
  );
}
