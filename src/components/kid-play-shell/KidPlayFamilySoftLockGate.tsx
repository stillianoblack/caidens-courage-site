import React, { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
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
import { resumeFamilyKidPlayShell } from '../../lib/resumeFamilyKidPlayShell';
import { triggerParentPush } from '../../lib/parentPushNotify';
import { buildSessionEndedPushDedupeKey } from '../../lib/parentPushNotifyDedupe';
import { readLocalKidPlaySessionId } from '../../lib/kidPlaySessionService';
import { assignPortalRoute } from '../../lib/portalHardNavigation';
import { verifyStudentPinLogin } from '../../lib/studentPinService';
import { launchStudentPinKidPlay } from '../../lib/studentPinLoginLaunch';
import { kidShellAwareNavigate } from '../../lib/kidShellNav';
import { clearKidPlayRosterLockWithEmail } from '../../lib/kidPlayRosterLock';
import '../kid-play-shell/kid-play-roster-lock.css';

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
  const location = useLocation();
  const { roster, selectParticipant } = useActiveParticipant();
  const [email, setEmail] = useState('');
  const [studentPin, setStudentPin] = useState('');
  const [facilitatorEmail, setFacilitatorEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const trimmed = email.trim();
      if (!trimmed) {
        setError('Enter your parent/guardian email to continue.');
        return;
      }

      setSubmitting(true);
      const ok = clearKidPlayFamilySoftLockWithEmail(trimmed);
      setSubmitting(false);

      if (!ok) {
        setError('Email does not match your family portal account.');
        return;
      }

      clearKidPlayFamilyResumePayload();
      setEmail('');
      onUnlocked();
      assignPortalRoute(`${readKidPlayFamilyReturnBase()}/weekly-adventures`);
    },
    [email, onUnlocked],
  );

  const handleStudentPinSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      const programCode = readActivePilotProgram()?.programCode?.trim();
      const pin = studentPin.trim();
      if (!programCode || !pin) {
        setError('Enter the student PIN to return to the game.');
        return;
      }

      setSubmitting(true);
      const verified = await verifyStudentPinLogin({ programCode, pin });
      if (!verified.success) {
        setSubmitting(false);
        setError(verified.error);
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
        setError(launch.message);
        return;
      }

      setKidPlayFamilySoftLocked(false);
      clearKidPlayFamilyResumePayload();
      setStudentPin('');
      onUnlocked();
      kidShellAwareNavigate(navigate, launch.path, { replace: true });
    },
    [navigate, onUnlocked, studentPin],
  );

  const handleFacilitatorSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      const trimmed = facilitatorEmail.trim();
      if (!trimmed) {
        setError('Enter facilitator email to return to the roster.');
        return;
      }

      setSubmitting(true);
      const ok = clearKidPlayRosterLockWithEmail(trimmed);
      setSubmitting(false);
      if (!ok) {
        setError('Email does not match this program facilitator account.');
        return;
      }

      setKidPlayFamilySoftLocked(false);
      clearKidPlayFamilyResumePayload();
      setFacilitatorEmail('');
      onUnlocked();
      assignPortalRoute(programDashboardTabPath('roster'));
    },
    [facilitatorEmail, onUnlocked],
  );

  const handleSelectChild = useCallback(
    async (participantId: string) => {
      const match = roster.find((row) => row.participantId === participantId);
      if (!match || submitting) return;

      setError(null);
      setSubmitting(true);
      selectParticipant(match);

      const result = await resumeFamilyKidPlayShell(navigate, {
        childId: participantId,
        familyReturnPath: readKidPlayFamilyReturnBase() || location.pathname,
      });

      setSubmitting(false);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      onUnlocked();
    },
    [location.pathname, navigate, onUnlocked, roster, selectParticipant, submitting],
  );

  const handleEndSession = useCallback(() => {
    setSubmitting(true);
    clearKidPlayFamilyResumePayload();
    setKidPlayFamilySoftLocked(false);
    clearSharedDevicePortalSession();
    const endedChild = roster.length === 1 ? roster[0].displayName : undefined;
    const endedChildId = roster.length === 1 ? roster[0].participantId : undefined;
    const sessionId = readLocalKidPlaySessionId() || 'manual-end';
    triggerParentPush({
      trigger: 'child_session_ended',
      childName: endedChild,
      childId: endedChildId,
      dedupeKey: buildSessionEndedPushDedupeKey(sessionId),
    });
    setSubmitting(false);
    onUnlocked();
    assignPortalRoute(PORTAL_PATH);
  }, [onUnlocked, roster]);

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
        className="kidPlayRosterLockCard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kid-play-family-soft-lock-title"
      >
        <h2 id="kid-play-family-soft-lock-title" className="kidPlayRosterLockTitle">
          Return To Session
        </h2>
        <p className="kidPlayRosterLockBody">
          Choose who is returning. Student PIN resumes the game; adult email returns to the right
          portal.
        </p>

        {roster.length === 1 ? (
          <div className="kidPlayRosterLockForm">
            <button
              type="button"
              className="kidPlayRosterLockSubmit"
              disabled={submitting}
              onClick={() => void handleSelectChild(roster[0].participantId)}
            >
              Continue as {roster[0].displayName}
            </button>
          </div>
        ) : null}

        {roster.length > 1 ? (
          <div className="kidPlayRosterLockForm">
            <p className="kidPlayRosterLockLabel">Choose player</p>
            <div className="kidPlayFamilySoftLockPicker">
              {roster.map((child) => (
                <button
                  key={child.participantId}
                  type="button"
                  className="kidPlayRosterLockSubmit"
                  disabled={submitting}
                  onClick={() => void handleSelectChild(child.participantId)}
                >
                  {child.displayName}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <form className="kidPlayRosterLockForm" onSubmit={handleEmailSubmit}>
          <label className="kidPlayRosterLockLabel" htmlFor="kid-play-family-soft-lock-email">
            Parent / Guardian Email
          </label>
          <input
            id="kid-play-family-soft-lock-email"
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
            Continue to Family Portal
          </button>
        </form>

        <form className="kidPlayRosterLockForm" onSubmit={(event) => void handleStudentPinSubmit(event)}>
          <label className="kidPlayRosterLockLabel" htmlFor="kid-play-family-soft-lock-pin">
            Student PIN
          </label>
          <input
            id="kid-play-family-soft-lock-pin"
            className="kidPlayRosterLockInput"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={studentPin}
            onChange={(event) => setStudentPin(event.target.value)}
            disabled={submitting}
          />
          <button type="submit" className="kidPlayRosterLockSubmit" disabled={submitting}>
            Return to Game
          </button>
        </form>

        <form className="kidPlayRosterLockForm" onSubmit={handleFacilitatorSubmit}>
          <label className="kidPlayRosterLockLabel" htmlFor="kid-play-family-soft-lock-facilitator-email">
            Facilitator Email
          </label>
          <input
            id="kid-play-family-soft-lock-facilitator-email"
            className="kidPlayRosterLockInput"
            type="email"
            autoComplete="email"
            value={facilitatorEmail}
            onChange={(event) => setFacilitatorEmail(event.target.value)}
            disabled={submitting}
          />
          <button type="submit" className="kidPlayRosterLockSubmit" disabled={submitting}>
            Continue to Roster
          </button>
        </form>

        <div className="kidPlayRosterLockForm">
          <button
            type="button"
            className="kidPlayRosterLockEndSession"
            disabled={submitting}
            onClick={handleEndSession}
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}
