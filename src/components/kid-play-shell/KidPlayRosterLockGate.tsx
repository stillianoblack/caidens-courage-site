import React, { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { FOCUS_FLAME_ACADEMY_MARK_SRC } from '../../design-system/brand/brandLogos';
import {
  continuityDecisionMessage,
  evaluateFacilitatorStudentContinuity,
  readFacilitatorStudentContinuity,
  resolveFacilitatorReturnPinProgramCode,
  restoreFacilitatorStudentViaPin,
} from '../../lib/facilitatorSessionContinuity';
import { setKidPlayRosterLocked, clearKidPlayRosterLockWithEmail } from '../../lib/kidPlayRosterLock';
import { buildPinFingerprint } from '../../lib/studentPinCrypto';
import { verifyStudentPinLogin } from '../../lib/studentPinService';
import { verifyStudentPinLoginWithProgramFallback } from '../../lib/studentPinProgramScope';
import './kid-play-roster-lock.css';

type KidPlayRosterLockGateProps = {
  open: boolean;
  onUnlocked: () => void;
};

const INVALID_PIN_MESSAGE = 'That PIN did not match. Try again or ask a facilitator.';

export default function KidPlayRosterLockGate({ open, onUnlocked }: KidPlayRosterLockGateProps) {
  const navigate = useNavigate();
  const [studentPin, setStudentPin] = useState('');
  const [facilitatorEmail, setFacilitatorEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleStudentPinSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const trimmedPin = studentPin.trim();
      if (!trimmedPin) {
        setError('Enter your student PIN to return to your adventure.');
        return;
      }

      const continuity = readFacilitatorStudentContinuity();
      const programCode = resolveFacilitatorReturnPinProgramCode({
        record: continuity,
        activeProgramCode: readActivePilotProgram()?.programCode,
      });

      setSubmitting(true);
      try {
        let verified = programCode
          ? await verifyStudentPinLogin({ programCode, pin: trimmedPin })
          : await verifyStudentPinLoginWithProgramFallback({
              pin: trimmedPin,
              campProgramCodeHint: continuity?.campProgramCode || continuity?.programCode,
              accessCodeHint: continuity?.activeAccessCode,
            });
        if (!verified.success && programCode) {
          verified = await verifyStudentPinLoginWithProgramFallback({
            pin: trimmedPin,
            campProgramCodeHint: continuity?.campProgramCode || continuity?.programCode || programCode,
            accessCodeHint: continuity?.activeAccessCode,
          });
        }
        if (!verified.success) {
          setError(INVALID_PIN_MESSAGE);
          return;
        }

        const pinFingerprint = await buildPinFingerprint(verified.programCode, trimmedPin);
        const decision = evaluateFacilitatorStudentContinuity({
          participantId: verified.participantId,
          pinFingerprint,
        });

        if (!decision.permitted) {
          setError(continuityDecisionMessage(decision));
          return;
        }

        const program = readActivePilotProgram();
        const restored = await restoreFacilitatorStudentViaPin({
          navigate,
          participantId: verified.participantId,
          displayName: verified.displayName,
          pinFingerprint,
          organizationId: program?.id ?? null,
        });

        if (!restored.ok) {
          setError(restored.message);
          return;
        }

        setKidPlayRosterLocked(false);
        setStudentPin('');
        setFacilitatorEmail('');
        onUnlocked();
      } finally {
        setSubmitting(false);
      }
    },
    [navigate, onUnlocked, studentPin],
  );

  const handleFacilitatorSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const trimmed = facilitatorEmail.trim();
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

      setStudentPin('');
      setFacilitatorEmail('');
      onUnlocked();
    },
    [facilitatorEmail, onUnlocked],
  );

  if (!open) return null;

  return (
    <div className="kidPlayRosterLock" role="presentation">
      <div
        className="kidPlayRosterLockCard kidPlayReturnSessionCard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kid-play-roster-lock-title"
      >
        <div className="kidPlayReturnSessionMarkWrap" aria-hidden="true">
          <img
            className="kidPlayReturnSessionMark"
            src={FOCUS_FLAME_ACADEMY_MARK_SRC}
            alt=""
            decoding="async"
          />
        </div>

        <h2 id="kid-play-roster-lock-title" className="kidPlayRosterLockTitle">
          Return To Session
        </h2>
        <p className="kidPlayRosterLockBody">
          Enter your student PIN to pick up where you left off, or ask a facilitator to unlock the device.
        </p>

        <form
          className="kidPlayRosterLockForm kidPlayReturnSessionForm"
          onSubmit={(event) => void handleStudentPinSubmit(event)}
        >
          <div className="kidPlayReturnSessionField">
            <label className="kidPlayRosterLockLabel" htmlFor="kid-play-roster-lock-pin">
              Student PIN
            </label>
            <input
              id="kid-play-roster-lock-pin"
              className="kidPlayRosterLockInput"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              value={studentPin}
              onChange={(event) => setStudentPin(event.target.value)}
              placeholder="Enter your PIN"
              disabled={submitting}
            />
          </div>

          {error ? (
            <p className="kidPlayRosterLockError kidPlayReturnSessionError" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="kidPlayRosterLockSubmit" disabled={submitting}>
            {submitting ? 'Continuing…' : 'Return to adventure'}
          </button>
        </form>

        <form
          className="kidPlayRosterLockForm kidPlayReturnSessionForm kidPlayRosterLockFacilitatorForm"
          onSubmit={handleFacilitatorSubmit}
        >
          <p className="kidPlayRosterLockDividerLabel">Facilitator unlock</p>
          <div className="kidPlayReturnSessionField">
            <label className="kidPlayRosterLockLabel" htmlFor="kid-play-roster-lock-email">
              Facilitator email
            </label>
            <input
              id="kid-play-roster-lock-email"
              className="kidPlayRosterLockInput"
              type="email"
              autoComplete="email"
              value={facilitatorEmail}
              onChange={(event) => setFacilitatorEmail(event.target.value)}
              disabled={submitting}
            />
          </div>
          <button type="submit" className="kidPlayRosterLockEndSession" disabled={submitting}>
            Continue to roster
          </button>
        </form>
      </div>
    </div>
  );
}
