import React from 'react';

type FacilitatorMoveSessionModalProps = {
  open: boolean;
  childName: string;
  loading?: boolean;
  onCancel: () => void;
  onMoveHere: () => void;
};

export default function FacilitatorMoveSessionModal({
  open,
  childName,
  loading = false,
  onCancel,
  onMoveHere,
}: FacilitatorMoveSessionModalProps) {
  if (!open) return null;

  return (
    <div className="kidPlayRosterLock" role="presentation">
      <div
        className="kidPlayRosterLockCard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kid-play-move-session-title"
      >
        <h2 id="kid-play-move-session-title" className="kidPlayRosterLockTitle">
          Move session here?
        </h2>
        <p className="kidPlayRosterLockBody">
          {childName} is already active on another device. Move session here?
        </p>
        <div className="kidPlayRosterLockForm">
          <button
            type="button"
            className="kidPlayRosterLockSubmit"
            onClick={onMoveHere}
            disabled={loading}
          >
            Move Here
          </button>
          <button
            type="button"
            className="kidPlayRosterLockInput"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
