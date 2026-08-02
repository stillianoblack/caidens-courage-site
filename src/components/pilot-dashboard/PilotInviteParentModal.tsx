import React, { useEffect, useId, useRef, useState } from 'react';
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

function focusableElements(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true');
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const submittingRef = useRef(submitting);

  onCloseRef.current = onClose;
  submittingRef.current = submitting;

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

    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const appRoot = document.getElementById('root');
    const previousAppAriaHidden = appRoot ? appRoot.getAttribute('aria-hidden') : null;
    const appRootWasInert = appRoot?.hasAttribute('inert') ?? false;
    appRoot?.setAttribute('aria-hidden', 'true');
    appRoot?.setAttribute('inert', '');
    const underlyingDrawer = document.querySelector<HTMLElement>('.facilitatorDrawerRoot[data-state="open"]');
    const previousDrawerAriaHidden = underlyingDrawer
      ? underlyingDrawer.getAttribute('aria-hidden')
      : null;
    const underlyingDrawerWasInert = underlyingDrawer?.hasAttribute('inert') ?? false;
    underlyingDrawer?.setAttribute('aria-hidden', 'true');
    underlyingDrawer?.setAttribute('inert', '');

    const focusFrame = window.requestAnimationFrame(() => emailRef.current?.focus({ preventScroll: true }));

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submittingRef.current) {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const items = focusableElements(dialogRef.current);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown, true);
      if (appRoot) {
        if (previousAppAriaHidden === null) appRoot.removeAttribute('aria-hidden');
        else appRoot.setAttribute('aria-hidden', previousAppAriaHidden);
        if (!appRootWasInert) appRoot.removeAttribute('inert');
      }
      if (underlyingDrawer) {
        if (previousDrawerAriaHidden === null) underlyingDrawer.removeAttribute('aria-hidden');
        else underlyingDrawer.setAttribute('aria-hidden', previousDrawerAriaHidden);
        if (!underlyingDrawerWasInert) underlyingDrawer.removeAttribute('inert');
      }
      window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    if (!isValidEmail(parentEmail)) {
      setLocalError('Enter a valid parent/guardian email.');
      emailRef.current?.focus();
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
        ref={dialogRef}
        className="family-studentPinModal pilot-inviteParentModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        aria-describedby={`${formId}-description`}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={`${formId}-title`} className="family-studentPinModalTitle">
          Invite Parent / Add Family
        </h2>
        <p id={`${formId}-description`} className="family-studentPinModalCopy">
          Connect a parent or guardian to <strong>{childName}</strong>.
        </p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor={`${formId}-email`} className="block text-sm font-semibold">
              Parent / Guardian email
            </label>
            <input
              ref={emailRef}
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
