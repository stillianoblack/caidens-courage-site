import React, { useCallback, useEffect, useRef, useState } from 'react';
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
    setSecondsLeft(Math.ceil(warningMs / 1000));
    if (countdownTimerRef.current != null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, [warningMs]);

  const scheduleIdleTimer = useCallback(() => {
    if (!enabled) return;
    clearTimers();
    idleTimerRef.current = window.setTimeout(() => {
      setOpen(true);
      setSecondsLeft(Math.ceil(warningMs / 1000));
    }, idleMs);
  }, [clearTimers, enabled, idleMs, warningMs]);

  const continuePlaying = useCallback(() => {
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

    return () => {
      clearTimers();
      for (const eventName of events) {
        window.removeEventListener(eventName, markActivity);
      }
    };
  }, [clearTimers, closeModal, enabled, open, scheduleIdleTimer]);

  useEffect(() => {
    if (!open) return undefined;

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
  }, [endSessionNow, open]);

  if (!enabled || !open) return null;

  return (
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
          Ending session in {secondsLeft} second{secondsLeft === 1 ? '' : 's'} to protect your
          progress.
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
    </div>
  );
}
