import React, { useEffect } from 'react';
import './b4-focus-flight-unlock-modal.css';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import { useB4Variant } from '../../hooks/useB4Variant';
import { getB4Asset } from '../../data/b4/variantManifest';

type B4FocusFlightUnlockModalProps = {
  open: boolean;
  onPlayNow: () => void;
  onDismiss: () => void;
};

export default function B4FocusFlightUnlockModal({
  open,
  onPlayNow,
  onDismiss,
}: B4FocusFlightUnlockModalProps) {
  const { participantId } = useActiveParticipant();
  const { variant } = useB4Variant(participantId);
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss, open]);

  if (!open) return null;

  return (
    <div className="b4UnlockModalBackdrop" role="presentation" onClick={onDismiss}>
      <section
        className="b4UnlockModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="b4-unlock-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="b4UnlockModalClose"
          onClick={onDismiss}
          aria-label="Close B-4 Focus Flight announcement"
        >
          x
        </button>
        <div className="b4UnlockSparkles" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="b4UnlockRobot" aria-hidden="true">
          <img src={getB4Asset(variant, 'happy')} alt="" />
        </div>
        <p className="b4UnlockKicker" aria-label="New game">
          <span aria-hidden="true">✨</span> NEW GAME <span aria-hidden="true">✨</span>
        </p>
        <h2 id="b4-unlock-title">Focus Flight</h2>
        <p className="b4UnlockMessage">
          Help B-4 collect every Focus Flame!
        </p>
        <div className="b4UnlockGameCard">
          <img
            className="b4UnlockFlame"
            src="/images/icons/FocusFlameIcon/focus-flame-transparent.png"
            alt=""
            aria-hidden="true"
          />
          <div>
            <strong>Focus Flight</strong>
            <span>Level 1 • Spark Run</span>
          </div>
        </div>
        <div className="b4UnlockActions">
          <button type="button" className="b4UnlockPrimary" onClick={onPlayNow}>
            Play Now
          </button>
          <button type="button" className="b4UnlockSecondary" onClick={onDismiss}>
            Maybe Later
          </button>
        </div>
      </section>
    </div>
  );
}
