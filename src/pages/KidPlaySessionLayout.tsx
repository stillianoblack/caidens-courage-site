import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { KidPlaySessionParticipantProvider } from '../context/ActiveParticipantContext';
import { KidPlaySessionProvider } from '../context/KidPlaySessionContext';
import {
  getKidPlaySessionById,
  resolveKidPlaySessionBehaviorFromRow,
  updateKidPlaySessionActivity,
  writeLocalKidPlaySessionId,
} from '../lib/kidPlaySessionService';
import type { KidPlaySessionRow } from '../lib/kidPlaySessionTypes';
import {
  endKidPlayShellSession,
  resolveKidPlaySessionExitPath,
} from '../lib/kidPlaySessionEnd';
import { fetchParticipantsByIds } from '../lib/studentFamilyLinkService';
import { resolveParticipantDisplayName, buildParticipantNameLookup } from '../lib/pilotResultsDisplay';
import {
  applyKidPlaySessionResume,
  parseKidPlayResumePayload,
} from '../lib/kidPlaySessionResume';
import { kidPlayShellNavigate } from '../lib/kidShellNav';
import { clearPageTransitionOverlay } from '../lib/pageTransition';
import {
  getKidPlayShellRoute,
  logKidShellIdle,
  logKidShellSession,
  resolveKidPlayShellModule,
  type KidPlayShellModuleId,
} from '../lib/kidPlayShellRoutes';
import KidPlayShellLoader from '../components/kid-play-shell/KidPlayShellLoader';
import { IdleSessionGuard } from '../design-system/narration';
import KidPlayShellNav from '../components/kid-play-shell/KidPlayShellNav';
import KidPlayShellExitModal from '../components/kid-play-shell/KidPlayShellExitModal';
import '../design-system/kids-adventure/character-art-image.css';
import '../components/kid-play-shell/kid-play-shell.css';
import '../components/kid-play-shell/kid-play-shell-nav.css';
import '../components/kid-play-shell/kid-play-shell-exit.css';
import '../components/kid-play-shell/kid-play-collections.css';
import '../components/kid-play-shell/kid-play-character-missions.css';
import '../components/kid-play-shell/kid-play-character-collection.css';

export default function KidPlaySessionLayout() {
  const { kidPlaySessionId = '' } = useParams<{ kidPlaySessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<KidPlaySessionRow | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [bootError, setBootError] = useState<string | null>(null);
  const [showBootLoader, setShowBootLoader] = useState(true);
  const [bootLoaderExiting, setBootLoaderExiting] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const resumeHandledRef = useRef(false);
  const initialPathRef = useRef(location.pathname);

  useEffect(() => {
    clearPageTransitionOverlay();
  }, []);

  useEffect(() => {
    let cancelled = false;
    resumeHandledRef.current = false;
    setShowBootLoader(true);
    setBootLoaderExiting(false);
    setSession(null);
    setDisplayName('');
    setFirstName('');

    async function boot() {
      const sessionId = kidPlaySessionId.trim();
      if (!sessionId) {
        if (!cancelled) setBootError('Missing session.');
        return;
      }

      const row = await getKidPlaySessionById(sessionId);
      if (!row || row.status !== 'active') {
        if (!cancelled) {
          kidPlayShellNavigate(navigate, resolveKidPlaySessionExitPath(row?.session_source), {
            replace: true,
          });
        }
        return;
      }

      writeLocalKidPlaySessionId(row.id);
      const { participants } = await fetchParticipantsByIds([row.child_id]);
      const participant = participants[0];
      const name = participant
        ? resolveParticipantDisplayName(participant.id, buildParticipantNameLookup([participant]))
        : 'Player';
      const legalFirstName = participant?.first_name?.trim() || name.split(/\s+/)[0] || name;

      if (cancelled) return;

      setSession(row);
      setDisplayName(name);
      setFirstName(legalFirstName);
      void updateKidPlaySessionActivity(row.id);

      const behavior = resolveKidPlaySessionBehaviorFromRow(row);
      logKidShellSession('boot', {
        sessionId: row.id,
        childId: row.child_id,
        sessionSource: row.session_source,
        deviceMode: row.device_mode,
        strictTimeout: behavior.strictTimeout,
        softReturn: behavior.softReturn,
      });

      const bootPath = initialPathRef.current;
      const atShellRoot =
        bootPath === `/play/session/${sessionId}` ||
        bootPath === `/play/session/${sessionId}/`;

      if (atShellRoot && !resumeHandledRef.current) {
        resumeHandledRef.current = true;
        const resume = parseKidPlayResumePayload(row.resume_payload);
        const restored = applyKidPlaySessionResume(navigate, row, resume);
        if (!restored) {
          kidPlayShellNavigate(navigate, getKidPlayShellRoute(sessionId, 'weekly-adventures'), {
            replace: true,
          });
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [kidPlaySessionId, navigate]);

  const isBooting = !session || !displayName;
  const showLoaderOverlay = isBooting || showBootLoader;

  useEffect(() => {
    if (isBooting || !showBootLoader) return;
    setBootLoaderExiting(true);
    const timer = window.setTimeout(() => setShowBootLoader(false), 460);
    return () => window.clearTimeout(timer);
  }, [displayName, isBooting, session, showBootLoader]);

  useEffect(() => {
    if (!session) return;
    const module = resolveKidPlayShellModule(location.pathname) ?? 'weekly-adventures';
    void updateKidPlaySessionActivity(session.id, {
      ...(session.resume_payload ?? {}),
      route: location.pathname + location.search,
      module,
      sessionId: session.id,
    });
  }, [location.pathname, location.search, session]);

  const handleEndSession = useCallback(
    (reason: 'idle_timeout' | 'user_exit' = 'idle_timeout') => {
      if (!session) return;
      const behavior = resolveKidPlaySessionBehaviorFromRow(session);
      logKidShellIdle(reason === 'user_exit' ? 'user_exit' : 'timeout_end', {
        sessionId: session.id,
        sessionSource: session.session_source,
        deviceMode: session.device_mode,
        strictTimeout: behavior.strictTimeout,
      });
      void endKidPlayShellSession(navigate, session, {
        reason,
        childDisplayName: displayName,
        childId: session.child_id,
        resumePayload: {
          route: location.pathname + location.search,
          module: (resolveKidPlayShellModule(location.pathname) ?? 'weekly-adventures') as KidPlayShellModuleId,
          endedFrom: reason === 'user_exit' ? 'kid_play_shell_exit' : 'kid_play_shell_idle',
        },
      });
    },
    [displayName, location.pathname, location.search, navigate, session],
  );

  const handleConfirmExit = useCallback(() => {
    setExitOpen(false);
    handleEndSession('user_exit');
  }, [handleEndSession]);

  if (bootError) {
    return (
      <div className="kid-play-shellLoader kid-play-shellLoader--error" role="alert">
        {bootError}
      </div>
    );
  }

  const activeModule = (resolveKidPlayShellModule(location.pathname) ?? 'weekly-adventures') as KidPlayShellModuleId;

  return (
    <>
      {!showLoaderOverlay && session ? (
        <KidPlaySessionParticipantProvider
          participantId={session.child_id}
          displayName={displayName}
          firstName={firstName}
        >
          <KidPlaySessionProvider session={session}>
            <div className="kid-play-shell">
              <KidPlayShellNav
                sessionId={session.id}
                activeModule={activeModule}
                onExitClick={() => setExitOpen(true)}
              />
              <Suspense fallback={null}>
                <Outlet key={`${location.pathname}${location.search}`} />
              </Suspense>
              <KidPlayShellExitModal
                open={exitOpen}
                onCancel={() => setExitOpen(false)}
                onConfirm={handleConfirmExit}
              />
              <IdleSessionGuard
                enabled
                onEndSession={() => handleEndSession('idle_timeout')}
                endSessionLabel="End Session"
              />
            </div>
          </KidPlaySessionProvider>
        </KidPlaySessionParticipantProvider>
      ) : null}
      {showLoaderOverlay ? (
        <KidPlayShellLoader fullScreen exiting={!isBooting && bootLoaderExiting} />
      ) : null}
    </>
  );
}
