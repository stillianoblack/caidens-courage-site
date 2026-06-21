import React, { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import Button from '../ui/Button';
import '../family-portal/family-student-pin-modal.css';
import './pilot-invite-parent-modal.css';

type PilotInviteParentModalProps = {
  open: boolean;
  childName: string;
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: {
    parentEmail: string;
    parentFirstName?: string;
    parentLastName?: string;
    sendWelcomeEmail: boolean;
  }) => void;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function PilotInviteParentModal({
  open,
  childName,
  submitting = false,
  error = null,
  onClose,
  onSubmit,
}: PilotInviteParentModalProps) {
  const formId = useId();
  const [parentEmail, setParentEmail] = useState('');
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useModalScrollLock(open);

  useEffect(() => {
    if (!open) {
      setParentEmail('');
      setParentFirstName('');
      setParentLastName('');
      setSendWelcomeEmail(true);
      setLocalError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open, submitting]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    if (!isValidEmail(parentEmail)) {
      setLocalError('Enter a valid parent/guardian email.');
      return;
    }
    onSubmit({
      parentEmail: parentEmail.trim(),
      parentFirstName: parentFirstName.trim() || undefined,
      parentLastName: parentLastName.trim() || undefined,
      sendWelcomeEmail,
    });
  };

  const displayError = localError || error;

  return createPortal(
    <div
      className="family-studentPinModalBackdrop pilot-inviteParentModalBackdrop"
      role="presentation"
      onClick={submitting ? undefined : onClose}
    >
      <div
        className="family-studentPinModal pilot-inviteParentModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={`${formId}-title`} className="family-studentPinModalTitle">
          Invite Parent / Add Family
        </h2>
        <p className="family-studentPinModalCopy">
          Connect a parent or guardian to <strong>{childName}</strong>.
        </p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor={`${formId}-email`} className="block text-sm font-semibold">
              Parent / Guardian email
            </label>
            <input
              id={`${formId}-email`}
              type="email"
              required
              value={parentEmail}
              onChange={(event) => setParentEmail(event.target.value)}
              className="cc-portal-code-input mt-1.5 w-full rounded-xl border border-navy-200/80 px-3 py-2.5"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${formId}-first`} className="block text-sm font-semibold">
                First name <span className="font-normal opacity-70">(optional)</span>
              </label>
              <input
                id={`${formId}-first`}
                type="text"
                value={parentFirstName}
                onChange={(event) => setParentFirstName(event.target.value)}
                className="cc-portal-code-input mt-1.5 w-full rounded-xl border border-navy-200/80 px-3 py-2.5"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-last`} className="block text-sm font-semibold">
                Last name <span className="font-normal opacity-70">(optional)</span>
              </label>
              <input
                id={`${formId}-last`}
                type="text"
                value={parentLastName}
                onChange={(event) => setParentLastName(event.target.value)}
                className="cc-portal-code-input mt-1.5 w-full rounded-xl border border-navy-200/80 px-3 py-2.5"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={sendWelcomeEmail}
              onChange={(event) => setSendWelcomeEmail(event.target.checked)}
            />
            <span>Send welcome email with access code, claim link, and student PIN instructions</span>
          </label>

          {displayError ? (
            <p className="rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {displayError}
            </p>
          ) : null}

          <div className="family-studentPinModalActions">
            <button type="button" className="family-settingsGhostBtn" disabled={submitting} onClick={onClose}>
              Cancel
            </button>
            <Button type="submit" variant="primary" size="md" leftIconSrc={null} disabled={submitting}>
              {submitting ? 'Saving…' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
