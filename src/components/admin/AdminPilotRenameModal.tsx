import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import { updatePilotProgramDisplayName } from '../../lib/adminPilotCleanupService';
import type { PilotProgramRecord } from '../../types/pilotProgram';

const MAX_PROGRAM_NAME_LENGTH = 80;

type AdminPilotRenameModalProps = {
  open: boolean;
  program: PilotProgramRecord | null;
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string) => void;
};

export default function AdminPilotRenameModal({
  open,
  program,
  onClose,
  onSaved,
  onToast,
}: AdminPilotRenameModalProps) {
  const [nameDraft, setNameDraft] = useState('');
  const [groupDraft, setGroupDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useModalScrollLock(open);

  useEffect(() => {
    if (!open || !program) return;
    setNameDraft(program.program_name);
    setGroupDraft(program.group_name ?? '');
    setError(null);
    setSaving(false);
  }, [open, program]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open || !program) return null;

  const trimmedName = nameDraft.trim();
  const trimmedGroup = groupDraft.trim();
  const displayNameChanged = trimmedName !== program.program_name.trim();
  const groupNameChanged = trimmedGroup !== (program.group_name ?? '').trim();
  const canSave =
    trimmedName.length > 0 &&
    trimmedName.length <= MAX_PROGRAM_NAME_LENGTH &&
    (displayNameChanged || groupNameChanged) &&
    !saving;

  const handleSave = async () => {
    if (!trimmedName) {
      setError('Program name is required.');
      return;
    }
    if (trimmedName.length > MAX_PROGRAM_NAME_LENGTH) {
      setError(`Program name must be ${MAX_PROGRAM_NAME_LENGTH} characters or fewer.`);
      return;
    }

    setSaving(true);
    setError(null);

    const result = await updatePilotProgramDisplayName(program.program_code, {
      programName: trimmedName,
      groupName: trimmedGroup,
    });

    setSaving(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    onToast('Program labels updated successfully.');
    onSaved();
    onClose();
  };

  return createPortal(
    <div className="adminPortal-modalBackdrop" role="presentation" onClick={onClose}>
      <div
        className="adminPortal-modal"
        role="dialog"
        aria-labelledby="admin-pilot-rename-title"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="adminPortal-modalClose"
          aria-label="Close rename dialog"
          onClick={onClose}
        >
          ×
        </button>

        <h2 id="admin-pilot-rename-title" className="adminPortal-modalTitle">
          Rename Program
        </h2>
        <p className="adminPortal-modalDescription">
          Update the display name and group label shown throughout the portals. Changing the display name will not change access codes.
        </p>

        <form
          className="adminPortal-modalForm"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSave) return;
            void handleSave();
          }}
        >
          <label className="adminPortal-modalField">
            <span className="adminPortal-modalLabel">Display Name</span>
            <input
              type="text"
              className="adminPortal-modalInput"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              maxLength={MAX_PROGRAM_NAME_LENGTH}
              autoFocus
              required
            />
          </label>

          <label className="adminPortal-modalField">
            <span className="adminPortal-modalLabel">Group Name</span>
            <input
              type="text"
              className="adminPortal-modalInput"
              value={groupDraft}
              onChange={(event) => setGroupDraft(event.target.value)}
              maxLength={MAX_PROGRAM_NAME_LENGTH}
            />
          </label>

          {error ? (
            <p className="adminPortal-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="adminPortal-modalActions">
            <button type="button" className="adminPortal-btn adminPortal-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="adminPortal-btn adminPortal-btn--primary"
              disabled={!canSave}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
