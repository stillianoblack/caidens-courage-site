import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import './family-student-pin-modal.css';

type FamilyStudentPinRegenerateModalProps = {
  open: boolean;
  submitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function FamilyStudentPinRegenerateModal({
  open,
  submitting = false,
  onCancel,
  onConfirm,
}: FamilyStudentPinRegenerateModalProps) {
  useModalScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, open, submitting]);

  if (!open) return null;

  return createPortal(
    <div className="family-studentPinModalBackdrop" role="presentation" onClick={submitting ? undefined : onCancel}>
      <div
        className="family-studentPinModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="family-student-pin-regenerate-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="family-student-pin-regenerate-title" className="family-studentPinModalTitle">
          Generate a new PIN?
        </h2>
        <p className="family-studentPinModalCopy">The previous PIN will stop working.</p>
        <div className="family-studentPinModalActions">
          <button
            type="button"
            className="family-settingsGhostBtn"
            disabled={submitting}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="family-settingsPrimaryBtn"
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting ? 'Generating…' : 'Generate New PIN'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
