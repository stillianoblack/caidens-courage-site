import React from 'react';
import './courage-b4-welcome.css';

const B4_TOKEN = '/images/caidenscourage/Game-Hub/characters/b4-hotspot.webp';

type CourageB4WelcomeOverlayProps = {
  open: boolean;
  onDismiss: () => void;
};

export default function CourageB4WelcomeOverlay({ open, onDismiss }: CourageB4WelcomeOverlayProps) {
  if (!open) return null;

  return (
    <div className="courageB4Welcome" role="dialog" aria-modal="true" aria-labelledby="courage-b4-welcome-title">
      <button
        type="button"
        className="courageB4WelcomeBackdrop"
        aria-label="Close welcome tip"
        onClick={onDismiss}
      />
      <div className="courageB4WelcomeCard">
        <button
          type="button"
          className="courageB4WelcomeClose"
          aria-label="Close"
          onClick={onDismiss}
        >
          ×
        </button>
        <div className="courageB4WelcomeAvatarWrap">
          <img src={B4_TOKEN} alt="" className="courageB4WelcomeAvatar" width={72} height={108} />
        </div>
        <p className="courageB4WelcomeEyebrow">B-4 says</p>
        <h2 id="courage-b4-welcome-title" className="courageB4WelcomeTitle">
          Welcome, Explorer! Choose a character and begin your first Focus Flame adventure.
        </h2>
        <button type="button" className="courageB4WelcomeBtn" onClick={onDismiss}>
          Start Exploring
        </button>
      </div>
    </div>
  );
}
