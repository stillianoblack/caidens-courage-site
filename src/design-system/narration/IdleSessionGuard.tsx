import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  logInactivityContext,
  resolveInactivitySessionContext,
} from '../../lib/inactivitySessionContext';
import './idle-session-guard.css';

const DEFAULT_IDLE_MS = 2 * 60 * 1000;
const DEFAULT_WARNING_MS = 30 * 1000;

export type IdleSessionGuardProps = {
  enabled?: boolean;
  idleMs?: number;
  warningMs?: number;
  onEndSession: () => void;
  /** @deprecated Use onEndSession */
  onReturn?: () => void;
};

export default function IdleSessionGuard({
  enabled = true,
  idleMs = DEFAULT_IDLE_MS,
  warningMs = DEFAULT_WARNING_MS,
  onEndSession,
  onReturn,
}: IdleSessionGuardProps) {
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(warningMs / 1000));
  const idleTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const onEndSessionRef = useRef(onEndSession ?? onReturn);
  const warnedRef = useRef(false);

  onEndSessionRef.current = onEndSession ?? onReturn;

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current != null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (countdownTimerRef.current != null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    warnedRef.current = false;
    setSecondsLeft(Math.ceil(warningMs / 1000));
    if (countdownTimerRef.current != null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, [warningMs]);

  const scheduleIdleTimer = useCallback(() => {
    if (!enabled || open) return;
    clearTimers();
    idleTimerRef.current = window.setTimeout(() => {
      setOpen(true);
      setSecondsLeft(Math.ceil(warningMs / 1000));
    }, idleMs);
  }, [clearTimers, enabled, idleMs, open, warningMs]);

  const continuePlaying = useCallback(() => {
    const context = resolveInactivitySessionContext();
    logInactivityContext('INACTIVITY_CONTINUE', context);
    closeModal();
    scheduleIdleTimer();
  }, [closeModal, scheduleIdleTimer]);

  const endSessionNow = useCallback(() => {
    closeModal();
    clearTimers();
    onEndSessionRef.current?.();
  }, [clearTimers, closeModal]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      closeModal();
      return undefined;
    }

    const markActivity = () => {
      if (open) return;
      scheduleIdleTimer();
    };

    scheduleIdleTimer();

    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'keydown',
      'touchstart',
      'mousemove',
      'scroll',
    ];

    for (const eventName of events) {
      window.addEventListener(eventName, markActivity, { passive: true });
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        markActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimers();
      for (const eventName of events) {
        window.removeEventListener(eventName, markActivity);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [clearTimers, closeModal, enabled, open, scheduleIdleTimer]);

  useEffect(() => {
    if (!open) return undefined;

    if (!warnedRef.current) {
      warnedRef.current = true;
      const context = resolveInactivitySessionContext();
      logInactivityContext('INACTIVITY_WARNING_SHOWN', context, {
        warningSeconds: Math.ceil(warningMs / 1000),
      });
      logInactivityContext('INACTIVITY_CONTEXT', context);
    }

    countdownTimerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          endSessionNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current != null) {
        window.clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [endSessionNow, open, warningMs]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!enabled || !open) return null;

  return createPortal(
    <div className="ds-idleGuardOverlay" role="presentation">
      <div
        className="ds-idleGuardModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="idle-guard-title"
        aria-describedby="idle-guard-desc"
      >
        <h2 id="idle-guard-title" className="ds-idleGuardTitle">
          Still playing?
        </h2>
        <p id="idle-guard-desc" className="ds-idleGuardBody">
          For your safety, we&apos;ll close this session soon to protect your progress and personal
          info.
        </p>
        <p className="ds-idleGuardCountdown" role="status" aria-live="polite">
          Ending session in {secondsLeft} second{secondsLeft === 1 ? '' : 's'}.
        </p>
        <div className="ds-idleGuardActions">
          <button type="button" className="ds-idleGuardBtn ds-idleGuardBtn--primary" onClick={continuePlaying}>
            Continue Playing
          </button>
          <button type="button" className="ds-idleGuardBtn" onClick={endSessionNow}>
            End Session Now
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
