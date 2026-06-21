import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import Button from '../ui/Button';

type ParentClaimViaPinModalProps = {
  open: boolean;
  childDisplayName: string;
  submitting?: boolean;
  error?: string | null;
  parentEmail?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentPhone?: string;
  onParentEmailChange: (value: string) => void;
  onParentFirstNameChange: (value: string) => void;
  onParentLastNameChange: (value: string) => void;
  onParentPhoneChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function ParentClaimViaPinModal({
  open,
  childDisplayName,
  submitting = false,
  error = null,
  parentEmail = '',
  parentFirstName = '',
  parentLastName = '',
  parentPhone = '',
  onParentEmailChange,
  onParentFirstNameChange,
  onParentLastNameChange,
  onParentPhoneChange,
  onCancel,
  onSubmit,
}: ParentClaimViaPinModalProps) {
  const formId = useId();
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
    <div
      className="family-studentPinModalBackdrop"
      role="presentation"
      onClick={submitting ? undefined : onCancel}
    >
      <div
        className="family-studentPinModal cc-portal-access-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={`${formId}-title`} className="family-studentPinModalTitle text-navy-500">
          Let&apos;s connect you to {childDisplayName}.
        </h2>
        <p className="family-studentPinModalCopy text-navy-600">
          Create your family access to view progress, settings, and weekly adventures.
        </p>

        <form className="mt-4 space-y-3" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor={`${formId}-email`} className="block text-sm font-semibold text-navy-600">
              Parent / Guardian email
            </label>
            <input
              id={`${formId}-email`}
              type="email"
              autoComplete="email"
              required
              value={parentEmail}
              onChange={(event) => onParentEmailChange(event.target.value)}
              className="cc-portal-code-input mt-1.5 w-full rounded-xl border border-navy-200/80 bg-[#FAF9F7] px-4 py-3 text-base font-medium text-navy-600"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${formId}-first`} className="block text-sm font-semibold text-navy-600">
                First name <span className="font-normal text-navy-500">(optional)</span>
              </label>
              <input
                id={`${formId}-first`}
                type="text"
                autoComplete="given-name"
                value={parentFirstName}
                onChange={(event) => onParentFirstNameChange(event.target.value)}
                className="cc-portal-code-input mt-1.5 w-full rounded-xl border border-navy-200/80 bg-[#FAF9F7] px-4 py-3 text-base font-medium text-navy-600"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-last`} className="block text-sm font-semibold text-navy-600">
                Last name <span className="font-normal text-navy-500">(optional)</span>
              </label>
              <input
                id={`${formId}-last`}
                type="text"
                autoComplete="family-name"
                value={parentLastName}
                onChange={(event) => onParentLastNameChange(event.target.value)}
                className="cc-portal-code-input mt-1.5 w-full rounded-xl border border-navy-200/80 bg-[#FAF9F7] px-4 py-3 text-base font-medium text-navy-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-phone`} className="block text-sm font-semibold text-navy-600">
              Phone <span className="font-normal text-navy-500">(optional)</span>
            </label>
            <input
              id={`${formId}-phone`}
              type="tel"
              autoComplete="tel"
              value={parentPhone}
              onChange={(event) => onParentPhoneChange(event.target.value)}
              className="cc-portal-code-input mt-1.5 w-full rounded-xl border border-navy-200/80 bg-[#FAF9F7] px-4 py-3 text-base font-medium text-navy-600"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          <div className="family-studentPinModalActions">
            <button
              type="button"
              className="family-settingsGhostBtn"
              disabled={submitting}
              onClick={onCancel}
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="md" leftIconSrc={null} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Family Access'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
