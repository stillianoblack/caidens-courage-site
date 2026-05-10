import React from 'react';

export type FocusFlameSoundGateProps = {
  onEnableSound: () => void;
  onContinueSilent: () => void;
};

/**
 * First-run prompt: unlocks browser audio policy when the user opts in.
 * Shown after boot; no autoplay before a choice.
 */
export default function FocusFlameSoundGate({ onEnableSound, onContinueSilent }: FocusFlameSoundGateProps) {
  return (
    <div className="ffl-soundGate" role="dialog" aria-modal="true" aria-labelledby="ffl-soundGate-title">
      <div className="ffl-soundGateBackdrop" aria-hidden="true" />
      <div className="ffl-soundGateCard">
        <h2 id="ffl-soundGate-title" className="ffl-soundGateTitle">
          Turn on sound?
        </h2>
        <p className="ffl-soundGateBody">B-4 can guide you with voice, music, and soft game sounds.</p>
        <div className="ffl-soundGateActions">
          <button type="button" className="ffl-soundGateBtn ffl-soundGateBtn--primary" onClick={onEnableSound}>
            Enable Sound
          </button>
          <button type="button" className="ffl-soundGateBtn ffl-soundGateBtn--ghost" onClick={onContinueSilent}>
            Continue Silent
          </button>
        </div>
      </div>
    </div>
  );
}
