import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import GlobalNotification from './GlobalNotification';
import { submitNetlifyForm } from '../utils/netlifyForms';

type CourageToolsPopupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCloseAfterSuccess: () => void;
  onSuccess: () => void;
};

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export default function CourageToolsPopupModal({
  isOpen,
  onClose,
  onCloseAfterSuccess,
  onSuccess,
}: CourageToolsPopupModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showNotice, setShowNotice] = useState(false);

  const handleClose = useCallback(() => {
    if (status === 'sending') return;
    onClose();
  }, [onClose, status]);

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setErrorMsg(null);
      setShowNotice(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => emailRef.current?.focus(), 120);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleClose, isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim() || '';
    const botField = (form.elements.namedItem('bot-field') as HTMLInputElement)?.value || '';

    if (!email || status === 'sending') return;

    setStatus('sending');
    setErrorMsg(null);
    setShowNotice(false);

    try {
      const res = await submitNetlifyForm('courage_toolkit', {
        role: 'Parent',
        organization: 'Website popup',
        email,
        consent: 'yes',
        source: 'courage-tools-popup',
        'bot-field': botField,
      });

      if (res.ok) {
        setStatus('success');
        setShowNotice(true);
        form.reset();
        onSuccess();
        window.setTimeout(() => onCloseAfterSuccess(), 3200);
      } else {
        setStatus('error');
        setErrorMsg('Please try again in a moment.');
        setShowNotice(true);
      }
    } catch {
      setStatus('error');
      setErrorMsg('Please try again in a moment.');
      setShowNotice(true);
    } finally {
      setStatus((current) => (current === 'sending' ? 'idle' : current));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="courage-tools-popup-backdrop fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="courage-tools-popup-panel relative w-full max-w-[780px] overflow-hidden rounded-[24px] border border-navy-100/80 bg-[#FAF9F7] shadow-[0_24px_64px_rgba(27,42,68,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-navy-200/80 bg-white text-lg leading-none text-navy-400 transition-colors hover:border-navy-300 hover:bg-navy-50 hover:text-navy-600 focus:outline-none focus:ring-2 focus:ring-golden-500 focus:ring-offset-2"
          aria-label="Close popup"
        >
          ×
        </button>

        <div className="grid gap-6 p-6 sm:gap-8 sm:p-8 md:grid-cols-[200px_1fr] md:items-stretch lg:grid-cols-[220px_1fr]">
          <figure className="flex flex-col items-center justify-center md:items-stretch">
            <img
              src="/images/camp-courage/stackworksheets.webp"
              alt="Printable Camp Courage SEL worksheets"
              className="w-full max-w-[220px] object-contain drop-shadow-[0_10px_24px_rgba(31,60,99,0.12)] md:max-w-none"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div className="min-w-0 pt-1 text-center md:pr-8 md:text-left">
            <h2
              id={titleId}
              className="font-display text-[1.5rem] font-extrabold leading-tight text-navy-500 sm:text-[1.75rem]"
            >
              Get free Courage tools for kids
            </h2>

            <p id={descId} className="mt-3 text-[15px] leading-relaxed text-navy-600 sm:text-base">
              Printable SEL activities, reading prompts, and Camp Courage updates for parents,
              educators, and caregivers.
            </p>

            <form
              name="courage_toolkit"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="mt-6"
            >
              <input type="hidden" name="form-name" value="courage_toolkit" />
              <input type="hidden" name="source" value="courage-tools-popup" />
              <p className="hidden">
                <label>
                  Don&apos;t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
                </label>
              </p>

              <label htmlFor="courage-tools-popup-email" className="sr-only">
                Email address
              </label>
              <input
                ref={emailRef}
                id="courage-tools-popup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                disabled={status === 'sending'}
                className="h-12 w-full rounded-xl border-2 border-[#C7D6EA] bg-white px-4 text-[16px] text-navy-600 placeholder:text-navy-400 outline-none transition-[border-color,box-shadow] focus:border-golden-500 focus:ring-2 focus:ring-golden-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              />

              <button
                type="submit"
                disabled={status === 'sending'}
                className="mt-3 inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-golden-500 px-8 text-[15px] font-semibold text-navy-500 shadow-[0_8px_20px_rgba(244,212,119,0.4)] transition-all duration-200 hover:bg-golden-400 hover:shadow-[0_10px_24px_rgba(244,212,119,0.5)] focus:outline-none focus:ring-2 focus:ring-golden-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 md:mt-4"
              >
                {status === 'sending' ? 'Sending…' : 'Send Me the Free Tools'}
              </button>
            </form>

            <p className="mt-4 text-xs leading-relaxed text-navy-500/75 sm:text-[13px]">
              No spam. Just helpful resources and launch updates.
            </p>

            {showNotice && (
              <div className="mt-4 text-left">
                <GlobalNotification
                  show={showNotice}
                  title={status === 'success' ? "You're in!" : "Hmm — that didn't send."}
                  message={
                    status === 'success'
                      ? "Thanks — we'll email you shortly. Keep an eye on your inbox (and spam folder)."
                      : errorMsg || 'Please try again in a moment.'
                  }
                  tone={status === 'success' ? 'success' : 'error'}
                  durationMs={5000}
                  autoClose
                  onClose={() => setShowNotice(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
