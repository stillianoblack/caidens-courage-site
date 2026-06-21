import React, { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PORTAL_PATH } from '../../config/courageRoutes';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import {
  hasRememberedProgramAccess,
  readRememberedProgramAccessCode,
  readRememberedProgramForContext,
  switchRememberedProgram,
} from '../../lib/rememberedProgramAccess';
import { clearChildSessionMemory } from '../../lib/endProtectedChildSession';
import {
  clearKidPlayFamilySoftLockWithEmail,
  setKidPlayFamilySoftLocked,
} from '../../lib/kidPlayFamilySoftLock';
import { clearKidPlayFamilyResumePayload } from '../../lib/kidPlayFamilyResume';
import { logOverlayActive } from '../../lib/portalClickDebug';
import { triggerParentPush } from '../../lib/parentPushNotify';
import { buildSessionEndedPushDedupeKey } from '../../lib/parentPushNotifyDedupe';
import { readLocalKidPlaySessionId } from '../../lib/kidPlaySessionService';
import { replaceWithPortalRoute } from '../../lib/portalHardNavigation';
import { verifyStudentPinLogin } from '../../lib/studentPinService';
import { launchStudentPinKidPlay } from '../../lib/studentPinLoginLaunch';
import { kidShellAwareNavigate } from '../../lib/kidShellNav';
import { clearKidPlayRosterLockWithEmail } from '../../lib/kidPlayRosterLock';
import {
  familyReturnSessionPath,
  facilitatorReturnSessionPath,
  resolveKidPlayReturnSessionDestination,
  studentReturnSessionPath,
  type KidPlayReturnSessionRole,
} from '../../lib/kidPlayReturnSessionRoute';
import {
  detectReturnSessionFacilitatorEmailMatch,
  detectReturnSessionParentEmailMatch,
  readPreferredReturnSessionRole,
} from '../../lib/kidPlayReturnSessionVerify';
import {
  KID_PLAY_RETURN_ACCESS_ERROR,
  verifyKidPlayReturnAccessCode,
} from '../../lib/kidPlayReturnUnlock';
import { clearStudentPinSession } from '../../lib/studentPinSession';
import '../kid-play-shell/kid-play-roster-lock.css';

import { FOCUS_FLAME_ACADEMY_MARK_SRC } from '../../design-system/brand/brandLogos';

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
  const [hideAccessCodeField, setHideAccessCodeField] = useState(() => hasRememberedProgramAccess());
  const [showRolePicker, setShowRolePicker] = useState(false);
  const rememberedAccessCode = readRememberedProgramAccessCode();

  const handleSwitchProgram = useCallback(() => {
    switchRememberedProgram(true);
    setHideAccessCodeField(false);
    setAccessCode('');
    setEmailOrPin('');
    setError(null);
    setShowRolePicker(false);
  }, []);

  const finishUnlock = useCallback(() => {
    setAccessCode('');
    setEmailOrPin('');
    setShowRolePicker(false);
    onUnlocked();
  }, [onUnlocked]);

  const routeToFamilyPortal = useCallback(() => {
    setKidPlayFamilySoftLocked(false);
    clearKidPlayFamilyResumePayload();
    finishUnlock();
    replaceWithPortalRoute(familyReturnSessionPath());
  }, [finishUnlock]);

  const routeToFacilitatorPortal = useCallback(() => {
    setKidPlayFamilySoftLocked(false);
    clearKidPlayFamilyResumePayload();
    finishUnlock();
    replaceWithPortalRoute(facilitatorReturnSessionPath());
  }, [finishUnlock]);

  const routeToKidShell = useCallback(
    (sessionId: string) => {
      setKidPlayFamilySoftLocked(false);
      clearKidPlayFamilyResumePayload();
      finishUnlock();
      kidShellAwareNavigate(navigate, studentReturnSessionPath(sessionId), { replace: true });
    },
    [finishUnlock, navigate],
  );

  const completeReturnSession = useCallback(
    async (input: {
      trimmedSecond: string;
      preferredRole?: KidPlayReturnSessionRole | null;
    }) => {
      const { trimmedSecond, preferredRole } = input;

      const destination = resolveKidPlayReturnSessionDestination({
        emailOrPin: trimmedSecond,
        parentEmailMatches: detectReturnSessionParentEmailMatch(trimmedSecond),
        facilitatorEmailMatches: detectReturnSessionFacilitatorEmailMatch(trimmedSecond),
        preferredRole: preferredRole ?? readPreferredReturnSessionRole(),
      });

      if (destination === 'role_picker') {
        setSubmitting(false);
        setShowRolePicker(true);
        setError(null);
        return;
      }

      if (destination === 'kid_shell') {
        const programCode =
          readActivePilotProgram()?.programCode?.trim() ||
          readRememberedProgramForContext()?.programCode?.trim() ||
          '';
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
          organizationId:
            readActivePilotProgram()?.id ?? readRememberedProgramForContext()?.id ?? null,
        });
        setSubmitting(false);
        if (launch.kind === 'error') {
          setError(KID_PLAY_RETURN_ACCESS_ERROR);
          return;
        }

        routeToKidShell(launch.session.id);
        return;
      }

      if (destination === 'facilitator_portal') {
        if (clearKidPlayRosterLockWithEmail(trimmedSecond)) {
          setSubmitting(false);
          routeToFacilitatorPortal();
          return;
        }
      }

      if (destination === 'family_portal') {
        if (clearKidPlayFamilySoftLockWithEmail(trimmedSecond)) {
          setSubmitting(false);
          routeToFamilyPortal();
          return;
        }
      }

      setSubmitting(false);
      setError(KID_PLAY_RETURN_ACCESS_ERROR);
    },
    [routeToFacilitatorPortal, routeToFamilyPortal, routeToKidShell],
  );

  const handleContinue = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setShowRolePicker(false);

      const trimmedCode = (accessCode.trim() || rememberedAccessCode).trim();
      const trimmedSecond = emailOrPin.trim();

      if ((!hideAccessCodeField && !trimmedCode) || !trimmedSecond) {
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

      await completeReturnSession({ trimmedSecond });
    },
    [accessCode, completeReturnSession, emailOrPin, hideAccessCodeField, rememberedAccessCode],
  );

  const handleRoleChoice = useCallback(
    (role: KidPlayReturnSessionRole) => {
      setError(null);
      setSubmitting(true);

      const trimmedSecond = emailOrPin.trim();

      void completeReturnSession({ trimmedSecond, preferredRole: role });
    },
    [completeReturnSession, emailOrPin],
  );

  const handleEndSession = useCallback(() => {
    setSubmitting(true);
    clearKidPlayFamilyResumePayload();
    setKidPlayFamilySoftLocked(false);
    clearChildSessionMemory();
    clearStudentPinSession();
    const sessionId = readLocalKidPlaySessionId() || 'manual-end';
    triggerParentPush({
      trigger: 'child_session_ended',
      dedupeKey: buildSessionEndedPushDedupeKey(sessionId),
    });
    setSubmitting(false);
    setAccessCode('');
    setEmailOrPin('');
    setShowRolePicker(false);
    onUnlocked();
    replaceWithPortalRoute(PORTAL_PATH);
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
          <img className="kidPlayReturnSessionMark" src={FOCUS_FLAME_ACADEMY_MARK_SRC} alt="" decoding="async" />
        </div>

        <h2 id="kid-play-family-soft-lock-title" className="kidPlayRosterLockTitle">
          Return To Session
        </h2>
        <p className="kidPlayRosterLockBody">
          {showRolePicker
            ? 'This email is linked to more than one role. Choose how you want to continue.'
            : hideAccessCodeField
              ? 'Enter a parent/guardian email, facilitator email, or student PIN to continue.'
              : 'Enter your access code and use a parent/guardian email, facilitator email, or student PIN to continue.'}
        </p>

        {showRolePicker ? (
          <div className="kidPlayFamilySoftLockPicker" role="group" aria-label="Choose your role">
            <button
              type="button"
              className="kidPlayRosterLockSubmit"
              disabled={submitting}
              onClick={() => handleRoleChoice('parent')}
            >
              Continue as parent/guardian
            </button>
            <button
              type="button"
              className="kidPlayRosterLockEndSession"
              disabled={submitting}
              onClick={() => handleRoleChoice('facilitator')}
            >
              Continue as facilitator
            </button>
            <button
              type="button"
              className="portal-welcomeBackLink kidPlayReturnSessionSwitchProgram"
              disabled={submitting}
              onClick={() => {
                setShowRolePicker(false);
                setError(null);
              }}
            >
              Back
            </button>
          </div>
        ) : (
          <form className="kidPlayRosterLockForm kidPlayReturnSessionForm" onSubmit={(event) => void handleContinue(event)}>
            {!hideAccessCodeField ? (
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
            ) : null}

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

            {hideAccessCodeField ? (
              <button
                type="button"
                className="portal-welcomeBackLink kidPlayReturnSessionSwitchProgram"
                disabled={submitting}
                onClick={handleSwitchProgram}
              >
                Not your program? Switch program
              </button>
            ) : null}

            <button
              type="button"
              className="kidPlayRosterLockEndSession"
              disabled={submitting}
              onClick={handleEndSession}
            >
              End Session
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
