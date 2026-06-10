import React from 'react';
import GameInteractionShell from '../game-assessment/shared/GameInteractionShell';

type B4BaselineBottomBarProps = {
  canCheck: boolean;
  checked: boolean;
  feedback?: string | null;
  feedbackTone?: 'success' | 'try' | 'neutral';
  /** Hide inline feedback — coaching rail shows headline instead */
  hideInlineFeedback?: boolean;
  /** Align footer actions with left game column (Focus Flame shell) */
  coachingShell?: boolean;
  onSkip: () => void;
  onCheck: () => void;
  onContinue: () => void;
};

export default function B4BaselineBottomBar({
  canCheck,
  checked,
  feedback,
  feedbackTone = 'neutral',
  hideInlineFeedback = false,
  coachingShell = false,
  onSkip,
  onCheck,
  onContinue,
}: B4BaselineBottomBarProps) {
  const showFeedback = Boolean(checked && feedback && !hideInlineFeedback);
  const barClass = [
    'bbc-bottomBar',
    coachingShell ? 'bbc-bottomBar--coachingShell' : '',
    checked && feedbackTone === 'success' ? 'bbc-bottomBar--success' : '',
    checked && feedbackTone === 'try' ? 'bbc-bottomBar--try' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const innerClass = [
    'bbc-bottomBarInner',
    coachingShell ? 'bbc-bottomBarInner--coachingShell' : '',
    showFeedback ? '' : 'bbc-bottomBarInner--continueOnly',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <footer className={barClass}>
      <GameInteractionShell>
        <div className={innerClass}>
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
              {showFeedback ? (
                <p className="bbc-feedbackBanner" role="status">
                  {feedback}
                </p>
              ) : null}
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
      </GameInteractionShell>
    </footer>
  );
}
