import React, { useCallback, useState, type FormEvent } from 'react';
import { clearKidPlayRosterLockWithEmail } from '../../lib/kidPlayRosterLock';
import './kid-play-roster-lock.css';

type KidPlayRosterLockGateProps = {
  open: boolean;
  onUnlocked: () => void;
};

export default function KidPlayRosterLockGate({ open, onUnlocked }: KidPlayRosterLockGateProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const trimmed = email.trim();
      if (!trimmed) {
        setError('Enter your facilitator email to continue.');
        return;
      }

      setSubmitting(true);
      const ok = clearKidPlayRosterLockWithEmail(trimmed);
      setSubmitting(false);

      if (!ok) {
        setError('Email does not match this program facilitator account.');
        return;
      }

      setEmail('');
      onUnlocked();
    },
    [email, onUnlocked],
  );

  if (!open) return null;

  return (
    <div className="kidPlayRosterLock" role="presentation">
      <div
        className="kidPlayRosterLockCard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kid-play-roster-lock-title"
      >
        <h2 id="kid-play-roster-lock-title" className="kidPlayRosterLockTitle">
          Session ended
        </h2>
        <p className="kidPlayRosterLockBody">
          Enter facilitator email/PIN to choose the next student.
        </p>
        <form className="kidPlayRosterLockForm" onSubmit={handleSubmit}>
          <label className="kidPlayRosterLockLabel" htmlFor="kid-play-roster-lock-email">
            Facilitator email
          </label>
          <input
            id="kid-play-roster-lock-email"
            className="kidPlayRosterLockInput"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
          />
          {error ? (
            <p className="kidPlayRosterLockError" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="kidPlayRosterLockSubmit" disabled={submitting}>
            Continue to roster
          </button>
        </form>
      </div>
    </div>
  );
}
