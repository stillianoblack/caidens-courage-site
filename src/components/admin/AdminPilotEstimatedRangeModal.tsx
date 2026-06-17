import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import { updatePilotProgramEstimatedRange } from '../../lib/adminPilotCleanupService';
import {
  ESTIMATED_STUDENT_COUNT_RANGE_OPTIONS,
  type EstimatedStudentCountRange,
  type PilotProgramRecord,
} from '../../types/pilotProgram';

type AdminPilotEstimatedRangeModalProps = {
  open: boolean;
  program: PilotProgramRecord | null;
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string) => void;
};

export default function AdminPilotEstimatedRangeModal({
  open,
  program,
  onClose,
  onSaved,
  onToast,
}: AdminPilotEstimatedRangeModalProps) {
  const [rangeDraft, setRangeDraft] = useState<EstimatedStudentCountRange | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useModalScrollLock(open);

  useEffect(() => {
    if (!open || !program) return;
    setRangeDraft(
      (program.estimated_student_count_range as EstimatedStudentCountRange | null) ?? '',
    );
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

  const currentRange = program.estimated_student_count_range?.trim() || null;
  const nextRange = rangeDraft || null;
  const canSave = nextRange !== currentRange && !saving;

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const result = await updatePilotProgramEstimatedRange(program.program_code, nextRange);

    setSaving(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    onToast('Estimated student range updated.');
    onSaved();
    onClose();
  };

  return createPortal(
    <div className="adminPortal-modalBackdrop" role="presentation" onClick={onClose}>
      <div
        className="adminPortal-modal"
        role="dialog"
        aria-labelledby="admin-pilot-estimate-title"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="adminPortal-modalClose"
          aria-label="Close estimated range dialog"
          onClick={onClose}
        >
          ×
        </button>

        <h2 id="admin-pilot-estimate-title" className="adminPortal-modalTitle">
          Edit Estimated Students
        </h2>
        <p className="adminPortal-modalDescription">
          Optional planning estimate for admin scale prep. Does not change portal access or live
          student counts.
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
            <span className="adminPortal-modalLabel">Estimated student range</span>
            <select
              className="adminPortal-modalInput"
              value={rangeDraft}
              onChange={(event) =>
                setRangeDraft(event.target.value as EstimatedStudentCountRange | '')
              }
            >
              <option value="">Not set</option>
              {ESTIMATED_STUDENT_COUNT_RANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
