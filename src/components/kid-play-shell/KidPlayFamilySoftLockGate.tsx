import React, { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PORTAL_PATH } from '../../config/courageRoutes';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { programDashboardTabPath } from '../../lib/programDashboardNav';
import { clearSharedDevicePortalSession } from '../../lib/endProtectedChildSession';
import {
  clearKidPlayFamilySoftLockWithEmail,
  setKidPlayFamilySoftLocked,
} from '../../lib/kidPlayFamilySoftLock';
import { clearKidPlayFamilyResumePayload } from '../../lib/kidPlayFamilyResume';
import { logOverlayActive } from '../../lib/portalClickDebug';
import { readKidPlayFamilyReturnBase } from '../../lib/kidPlayShellRoutes';
import { triggerParentPush } from '../../lib/parentPushNotify';
import { buildSessionEndedPushDedupeKey } from '../../lib/parentPushNotifyDedupe';
import { readLocalKidPlaySessionId } from '../../lib/kidPlaySessionService';
import { assignPortalRoute } from '../../lib/portalHardNavigation';
import { verifyStudentPinLogin } from '../../lib/studentPinService';
import { launchStudentPinKidPlay } from '../../lib/studentPinLoginLaunch';
import { kidShellAwareNavigate } from '../../lib/kidShellNav';
import { clearKidPlayRosterLockWithEmail } from '../../lib/kidPlayRosterLock';
import {
  KID_PLAY_RETURN_ACCESS_ERROR,
  STUDENT_PIN_INPUT_RE,
  verifyKidPlayReturnAccessCode,
} from '../../lib/kidPlayReturnUnlock';
import '../kid-play-shell/kid-play-roster-lock.css';

const FOCUS_FLAME_MARK_SRC = '/images/icons/focus-flame-mark.svg';

type KidPlayFamilySoftLockGateProps = {
  open: boolean;
  onUnlocked: () => void;
  /** Full-screen gate page (PWA / play-pause route) */
  fullscreen?: boolean;
};

export default function KidPlayFamilySoftLockGate({
  open,
  onUnlocked,
  fullscreen = false,
}: KidPlayFamilySoftLockGateProps) {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [emailOrPin, setEmailOrPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const trimmedCode = accessCode.trim();
      const trimmedSecond = emailOrPin.trim();

      if (!trimmedCode || !trimmedSecond) {
        setError(KID_PLAY_RETURN_ACCESS_ERROR);
        return;
      }

      setSubmitting(true);
      const codeOk = await verifyKidPlayReturnAccessCode(trimmedCode);
      if (!codeOk) {
        setSubmitting(false);
        setError(KID_PLAY_RETURN_ACCESS_ERROR);
        return;
      }

      if (STUDENT_PIN_INPUT_RE.test(trimmedSecond)) {
        const programCode = readActivePilotProgram()?.programCode?.trim();
        if (!programCode) {
          setSubmitting(false);
          setError(KID_PLAY_RETURN_ACCESS_ERROR);
          return;
        }

        const verified = await verifyStudentPinLogin({ programCode, pin: trimmedSecond });
        if (!verified.success) {
          setSubmitting(false);
          setError(KID_PLAY_RETURN_ACCESS_ERROR);
          return;
        }

        const launch = await launchStudentPinKidPlay({
          participantId: verified.participantId,
          programCode: verified.programCode,
          displayName: verified.displayName,
          organizationId: readActivePilotProgram()?.id ?? null,
        });
        setSubmitting(false);
        if (launch.kind === 'error') {
          setError(KID_PLAY_RETURN_ACCESS_ERROR);
          return;
        }

        setKidPlayFamilySoftLocked(false);
        clearKidPlayFamilyResumePayload();
        setAccessCode('');
        setEmailOrPin('');
        onUnlocked();
        kidShellAwareNavigate(navigate, launch.path, { replace: true });
        return;
      }

      if (clearKidPlayRosterLockWithEmail(trimmedSecond)) {
        setSubmitting(false);
        setKidPlayFamilySoftLocked(false);
        clearKidPlayFamilyResumePayload();
        setAccessCode('');
        setEmailOrPin('');
        onUnlocked();
        assignPortalRoute(programDashboardTabPath('roster'));
        return;
      }

      if (clearKidPlayFamilySoftLockWithEmail(trimmedSecond)) {
        setSubmitting(false);
        clearKidPlayFamilyResumePayload();
        setAccessCode('');
        setEmailOrPin('');
        onUnlocked();
        assignPortalRoute(`${readKidPlayFamilyReturnBase()}/weekly-adventures`);
        return;
      }

      setSubmitting(false);
      setError(KID_PLAY_RETURN_ACCESS_ERROR);
    },
    [accessCode, emailOrPin, navigate, onUnlocked],
  );

  const handleEndSession = useCallback(() => {
    setSubmitting(true);
    clearKidPlayFamilyResumePayload();
    setKidPlayFamilySoftLocked(false);
    clearSharedDevicePortalSession();
    const sessionId = readLocalKidPlaySessionId() || 'manual-end';
    triggerParentPush({
      trigger: 'child_session_ended',
      dedupeKey: buildSessionEndedPushDedupeKey(sessionId),
    });
    setSubmitting(false);
    setAccessCode('');
    setEmailOrPin('');
    onUnlocked();
    assignPortalRoute(PORTAL_PATH);
  }, [onUnlocked]);

  useEffect(() => {
    logOverlayActive('KidPlayFamilySoftLockGate', open);
  }, [open]);

  if (!open) return null;

  const shellClass = [
    'kidPlayRosterLock',
    fullscreen ? 'kidPlayRosterLock--fullscreen' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass} role="presentation">
      <div
        className="kidPlayRosterLockCard kidPlayReturnSessionCard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kid-play-family-soft-lock-title"
      >
        <div className="kidPlayReturnSessionMarkWrap" aria-hidden="true">
          <img className="kidPlayReturnSessionMark" src={FOCUS_FLAME_MARK_SRC} alt="" decoding="async" />
        </div>

        <h2 id="kid-play-family-soft-lock-title" className="kidPlayRosterLockTitle">
          Return To Session
        </h2>
        <p className="kidPlayRosterLockBody">
          Enter your access code and use a parent/guardian email, facilitator email, or student PIN to
          continue.
        </p>

        <form className="kidPlayRosterLockForm kidPlayReturnSessionForm" onSubmit={(event) => void handleContinue(event)}>
          <div className="kidPlayReturnSessionField">
            <label className="kidPlayRosterLockLabel" htmlFor="kid-play-return-access-code">
              Access Code
            </label>
            <input
              id="kid-play-return-access-code"
              className="kidPlayRosterLockInput"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Enter your code"
              disabled={submitting}
            />
          </div>

          <div className="kidPlayReturnSessionField">
            <label className="kidPlayRosterLockLabel" htmlFor="kid-play-return-email-or-pin">
              Email or Student PIN
            </label>
            <input
              id="kid-play-return-email-or-pin"
              className="kidPlayRosterLockInput"
              type="text"
              autoComplete="off"
              value={emailOrPin}
              onChange={(event) => setEmailOrPin(event.target.value)}
              placeholder="Email or student PIN"
              disabled={submitting}
            />
          </div>

          {error ? (
            <p className="kidPlayRosterLockError kidPlayReturnSessionError" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="kidPlayRosterLockSubmit" disabled={submitting}>
            {submitting ? 'Continuing…' : 'Continue'}
          </button>

          <button
            type="button"
            className="kidPlayRosterLockEndSession"
            disabled={submitting}
            onClick={handleEndSession}
          >
            End Session
          </button>
        </form>
      </div>
    </div>
  );
}
