import React, { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PORTAL_PATH } from '../../config/courageRoutes';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { FOCUS_FLAME_ACADEMY_MARK_SRC } from '../../design-system/brand/brandLogos';
import {
  clearFacilitatorStudentContinuity,
  continuityDecisionMessage,
  evaluateFacilitatorStudentContinuity,
  readFacilitatorStudentContinuity,
  resolveFacilitatorReturnPinProgramCode,
  restoreFacilitatorStudentViaPin,
} from '../../lib/facilitatorSessionContinuity';
import {
  clearKidPlayRosterLockForSecureSession,
  setKidPlayRosterLocked,
} from '../../lib/kidPlayRosterLock';
import {
  verifyFacilitatorSessionForProgram,
  type ScopedFacilitatorSessionResult,
} from '../../lib/facilitatorSessionApi';
import { replaceWithPortalRoute } from '../../lib/portalHardNavigation';
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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [facilitatorSession, setFacilitatorSession] = useState<ScopedFacilitatorSessionResult | null>(null);

  const checkFacilitatorSession = useCallback(async () => {
    const programCode =
      readFacilitatorStudentContinuity()?.campProgramCode?.trim() ||
      readFacilitatorStudentContinuity()?.programCode?.trim() ||
      readActivePilotProgram()?.programCode?.trim() ||
      '';
    setSubmitting(true);
    setError(null);
    const result = await verifyFacilitatorSessionForProgram(programCode);
    setFacilitatorSession(result);
    setSubmitting(false);
    return result;
  }, []);

  useEffect(() => {
    if (!open) return;
    void checkFacilitatorSession();
  }, [checkFacilitatorSession, open]);

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
            });
        if (!verified.success && programCode) {
          verified = await verifyStudentPinLoginWithProgramFallback({
            pin: trimmedPin,
            campProgramCodeHint: continuity?.campProgramCode || continuity?.programCode || programCode,
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
        onUnlocked();
      } finally {
        setSubmitting(false);
      }
    },
    [navigate, onUnlocked, studentPin],
  );

  const handleFacilitatorReturn = useCallback(async () => {
    const result = facilitatorSession?.status === 'authorized'
      ? facilitatorSession
      : await checkFacilitatorSession();
    if (result.status !== 'authorized') {
      setError(
        result.status === 'wrong_program'
          ? 'This facilitator session belongs to a different program. Sign in to this program to continue.'
          : 'Your facilitator session is no longer available. Sign in again to continue.',
      );
      return;
    }
    clearKidPlayRosterLockForSecureSession();
    setStudentPin('');
    onUnlocked();
  }, [checkFacilitatorSession, facilitatorSession, onUnlocked]);

  const handleEndStudentSession = useCallback(() => {
    clearFacilitatorStudentContinuity();
    setKidPlayRosterLocked(false);
    setStudentPin('');
    setError(null);
    onUnlocked();
  }, [onUnlocked]);

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

        <div className="kidPlayRosterLockForm kidPlayReturnSessionForm kidPlayRosterLockFacilitatorForm">
          <p className="kidPlayRosterLockDividerLabel">Facilitator unlock</p>
          <button
            type="button"
            className="kidPlayRosterLockEndSession"
            disabled={submitting || facilitatorSession?.status !== 'authorized'}
            onClick={() => void handleFacilitatorReturn()}
          >
            {submitting ? 'Checking session…' : 'Return to Explorers'}
          </button>
          <button
            type="button"
            className="portal-welcomeBackLink kidPlayReturnSessionSwitchProgram"
            disabled={submitting}
            onClick={() => void checkFacilitatorSession()}
          >
            Retry secure facilitator session
          </button>
          {facilitatorSession && facilitatorSession.status !== 'authorized' ? (
            <button
              type="button"
              className="portal-welcomeBackLink kidPlayReturnSessionSwitchProgram"
              disabled={submitting}
              onClick={() => replaceWithPortalRoute(PORTAL_PATH)}
            >
              Return to Enter the World
            </button>
          ) : null}
          <button
            type="button"
            className="portal-welcomeBackLink kidPlayReturnSessionSwitchProgram"
            disabled={submitting}
            onClick={handleEndStudentSession}
          >
            End this student session
          </button>
        </div>
      </div>
    </div>
  );
}
