import React from 'react';
import { createPortal } from 'react-dom';
import './kid-play-shell-exit.css';

type KidPlayShellExitModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function KidPlayShellExitModal({
  open,
  onCancel,
  onConfirm,
}: KidPlayShellExitModalProps) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="kidPlayShellExitOverlay" role="presentation">
      <div
        className="kidPlayShellExitModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kid-play-shell-exit-title"
        aria-describedby="kid-play-shell-exit-body"
      >
        <h2 id="kid-play-shell-exit-title" className="kidPlayShellExitTitle">
          Exit game?
        </h2>
        <p id="kid-play-shell-exit-body" className="kidPlayShellExitBody">
          Your progress is saved. Return to the Family Portal?
        </p>
        <div className="kidPlayShellExitActions">
          <button type="button" className="kidPlayShellExitModalBtn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="kidPlayShellExitModalBtn kidPlayShellExitModalBtn--primary"
            onClick={onConfirm}
          >
            Exit Game
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
