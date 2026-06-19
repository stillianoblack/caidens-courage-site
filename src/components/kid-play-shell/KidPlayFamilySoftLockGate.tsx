import React, { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import { PORTAL_PATH } from '../../config/courageRoutes';
import { clearSharedDevicePortalSession } from '../../lib/endProtectedChildSession';
import {
  clearKidPlayFamilySoftLockWithEmail,
  setKidPlayFamilySoftLocked,
} from '../../lib/kidPlayFamilySoftLock';
import { clearKidPlayFamilyResumePayload } from '../../lib/kidPlayFamilyResume';
import { kidShellAwareNavigate } from '../../lib/kidShellNav';
import { logOverlayActive } from '../../lib/portalClickDebug';
import { familyPortalPath } from '../../lib/familyPortalPaths';
import { readKidPlayFamilyReturnBase } from '../../lib/kidPlayShellRoutes';
import { resumeFamilyKidPlayShell } from '../../lib/resumeFamilyKidPlayShell';
import { triggerParentPush } from '../../lib/parentPushNotify';
import { buildSessionEndedPushDedupeKey } from '../../lib/parentPushNotifyDedupe';
import { readLocalKidPlaySessionId } from '../../lib/kidPlaySessionService';
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
      kidShellAwareNavigate(navigate, familyPortalPath('weekly-adventures', location.pathname), {
        replace: true,
      });
    },
    [email, location.pathname, navigate, onUnlocked],
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
    kidShellAwareNavigate(navigate, PORTAL_PATH, {
      replace: true,
      state: { portalMessage: 'Session ended. Enter your access code to continue.' },
    });
  }, [navigate, onUnlocked, roster]);

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
          Child session paused
        </h2>
        <p className="kidPlayRosterLockBody">
          For safety, the child game closed after inactivity. Choose who is playing or enter parent
          email to continue.
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
            Parent/guardian email
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
