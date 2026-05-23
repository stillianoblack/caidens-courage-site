import { useCallback, useEffect, useState } from 'react';

const STORAGE_DISMISSED_AT = 'cc_courage_tools_popup_dismissed_at';
const STORAGE_SUBMITTED = 'cc_courage_tools_popup_submitted';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const TRIGGER_DELAY_MS = 30_000;
const SCROLL_DEPTH = 0.6;

function canShowPopup(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(STORAGE_SUBMITTED) === 'true') return false;

  const dismissedAt = localStorage.getItem(STORAGE_DISMISSED_AT);
  if (dismissedAt) {
    const elapsed = Date.now() - Number.parseInt(dismissedAt, 10);
    if (!Number.isNaN(elapsed) && elapsed < DISMISS_MS) return false;
  }

  return true;
}

export function useCourageToolsPopupTrigger(enabled: boolean) {
  const [armed, setArmed] = useState(enabled && canShowPopup());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setArmed(enabled && canShowPopup());
  }, [enabled]);

  useEffect(() => {
    if (!armed || isOpen) return;

    let triggered = false;

    const openPopup = () => {
      if (triggered) return;
      triggered = true;
      setIsOpen(true);
      cleanup();
    };

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const depth = window.scrollY / scrollable;
      if (depth >= SCROLL_DEPTH) openPopup();
    };

    const timerId = window.setTimeout(openPopup, TRIGGER_DELAY_MS);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const cleanup = () => {
      window.clearTimeout(timerId);
      window.removeEventListener('scroll', onScroll);
    };

    return cleanup;
  }, [armed, isOpen]);

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_DISMISSED_AT, String(Date.now()));
    setIsOpen(false);
    setArmed(false);
  }, []);

  const markSubmitted = useCallback(() => {
    localStorage.setItem(STORAGE_SUBMITTED, 'true');
    setArmed(false);
  }, []);

  return { armed, isOpen, closePopup, dismiss, markSubmitted };
}
