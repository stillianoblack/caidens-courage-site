import React from 'react';
import CheckButton from '../../design-system/game/CheckButton';
import ExplainMoreButton from '../../design-system/game/ExplainMoreButton';
import FeedbackPanel from '../../design-system/game/FeedbackPanel';
import HintButton from '../../design-system/game/HintButton';
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
  canTryAgain?: boolean;
  canUseHint?: boolean;
  canExplainMore?: boolean;
  showExplainMore?: boolean;
  explainMore?: string;
  activeHint?: string | null;
  onSkip: () => void;
  onCheck: () => void;
  onContinue: () => void;
  onTryAgain?: () => void;
  onUseHint?: () => void;
  onToggleExplainMore?: () => void;
};

export default function B4BaselineBottomBar({
  canCheck,
  checked,
  feedback,
  feedbackTone = 'neutral',
  hideInlineFeedback = false,
  coachingShell = false,
  canTryAgain = false,
  canUseHint = false,
  canExplainMore = false,
  showExplainMore = false,
  explainMore,
  activeHint,
  onSkip,
  onCheck,
  onContinue,
  onTryAgain,
  onUseHint,
  onToggleExplainMore,
}: B4BaselineBottomBarProps) {
  const showInlineFeedback = Boolean(checked && feedback && !hideInlineFeedback);
  const showContinue = checked && !canTryAgain;
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
    showContinue || showInlineFeedback ? '' : 'bbc-bottomBarInner--continueOnly',
    canTryAgain ? 'bbc-bottomBarInner--retry' : '',
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
              <CheckButton disabled={!canCheck} onClick={onCheck} />
            </>
          ) : (
            <>
              {showInlineFeedback ? (
                <FeedbackPanel
                  tone={feedbackTone}
                  message={feedback!}
                  hint={activeHint}
                  explainMore={explainMore}
                  showExplainMore={showExplainMore}
                  canExplainMore={canExplainMore}
                  onToggleExplainMore={onToggleExplainMore}
                />
              ) : activeHint && hideInlineFeedback ? (
                <p className="bbc-feedbackBanner bbc-feedbackBanner--hint" role="status">
                  <span className="bbc-feedbackBannerLabel">Hint:</span> {activeHint}
                </p>
              ) : null}
              <div className="bbc-bottomBarActions">
                {canTryAgain && onTryAgain ? (
                  <button type="button" className="bbc-tryAgainBtn" onClick={onTryAgain}>
                    Try Again
                  </button>
                ) : null}
                {canUseHint && onUseHint ? <HintButton onClick={onUseHint} /> : null}
                {canExplainMore && onToggleExplainMore && hideInlineFeedback ? (
                  <ExplainMoreButton
                    expanded={showExplainMore}
                    onClick={onToggleExplainMore}
                  />
                ) : null}
                {showContinue ? (
                  <CheckButton
                    label="Continue"
                    className="bbc-checkBtn--continue"
                    onClick={onContinue}
                  />
                ) : null}
              </div>
            </>
          )}
        </div>
      </GameInteractionShell>
    </footer>
  );
}
