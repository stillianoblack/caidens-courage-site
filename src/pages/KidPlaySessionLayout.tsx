import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { KidPlaySessionParticipantProvider } from '../context/ActiveParticipantContext';
import { KidPlaySessionProvider } from '../context/KidPlaySessionContext';
import { MyAdventuresProvider } from '../context/MyAdventuresContext';
import { PortalSessionProvider } from '../context/PortalSessionContext';
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
import B4FocusFlightUnlockModal from '../components/kid-play-shell/B4FocusFlightUnlockModal';
import B4UnitOnboardingModal from '../components/b4/B4UnitOnboardingModal';
import KidPlayMyAdventures from '../components/kid-play-shell/KidPlayMyAdventures';
import KidPlayFamilySoftLockGate from '../components/kid-play-shell/KidPlayFamilySoftLockGate';
import { isKidPlayFamilySoftLocked } from '../lib/kidPlayFamilySoftLock';
import {
  B4_FOCUS_FLIGHT_UNLOCK_EVENT,
  getB4FocusFlightUnlockState,
  markB4FocusFlightUnlockSeen,
  requestB4FocusFlightHighlight,
} from '../lib/b4FocusFlightUnlock';
import '../design-system/kids-adventure/character-art-image.css';
import '../components/kid-play-shell/kid-play-shell.css';
import '../components/kid-play-shell/kid-play-shell-nav.css';
import '../components/kid-play-shell/kid-play-shell-exit.css';
import '../components/kid-play-shell/kid-play-collections.css';
import '../components/kid-play-shell/kid-play-character-missions.css';
import '../components/kid-play-shell/kid-play-character-collection.css';

export default function KidPlaySessionLayout() {
  return (
    <PortalSessionProvider>
      <KidPlaySessionLayoutContent />
    </PortalSessionProvider>
  );
}

function KidPlaySessionLayoutContent() {
  const { kidPlaySessionId = '' } = useParams<{ kidPlaySessionId: string }>();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const location = useLocation();
  const [session, setSession] = useState<KidPlaySessionRow | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [showBootLoader, setShowBootLoader] = useState(true);
  const [bootLoaderExiting, setBootLoaderExiting] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [showB4UnlockModal, setShowB4UnlockModal] = useState(false);
  const [showArcadeNewBadge, setShowArcadeNewBadge] = useState(false);
  const [returnSessionOpen, setReturnSessionOpen] = useState(() => isKidPlayFamilySoftLocked());
  const resumeHandledRef = useRef(false);
  const initialPathRef = useRef(location.pathname);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

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
    setGradeLevel(null);

    async function boot() {
      const sessionId = kidPlaySessionId.trim();
      if (!sessionId) {
        if (!cancelled) setBootError('Missing session.');
        return;
      }

      const row = await getKidPlaySessionById(sessionId);
      if (!row || row.status !== 'active') {
        if (!cancelled) {
          kidPlayShellNavigate(
            navigateRef.current,
            resolveKidPlaySessionExitPath(row?.session_source),
            {
              replace: true,
            },
          );
        }
        return;
      }

      writeLocalKidPlaySessionId(row.id);
      const serverHydratedSession =
        row.session_source === 'facilitator_roster_launch' || row.session_source === 'family_home';
      const { participants } = serverHydratedSession
        ? { participants: [] }
        : await fetchParticipantsByIds([row.child_id]);
      const participant = participants[0];
      const sessionDisplayName = String(row.resume_payload?.participant_display_name || '').trim();
      const sessionFirstName = String(row.resume_payload?.participant_first_name || '').trim();
      const sessionGradeLevel = String(row.resume_payload?.participant_grade_level || '').trim();
      const name = participant
        ? resolveParticipantDisplayName(participant.id, buildParticipantNameLookup([participant]))
        : sessionDisplayName || 'Player';
      const legalFirstName = participant?.first_name?.trim() || sessionFirstName || name.split(/\s+/)[0] || name;

      if (cancelled) return;

      setSession(row);
      setDisplayName(name);
      setFirstName(legalFirstName);
      setGradeLevel(sessionGradeLevel || participant?.grade_level?.trim() || null);
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
        const restored = applyKidPlaySessionResume(navigateRef.current, row, resume);
        if (!restored) {
          kidPlayShellNavigate(
            navigateRef.current,
            getKidPlayShellRoute(sessionId, 'weekly-adventures'),
            {
              replace: true,
            },
          );
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [kidPlaySessionId]);

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
      route: location.pathname,
      module,
      sessionId: session.id,
    });
  }, [location.pathname, session]);

  useEffect(() => {
    if (showLoaderOverlay || !session) return undefined;

    const refreshUnlockState = () => {
      const unlockState = getB4FocusFlightUnlockState(session.child_id);
      setShowArcadeNewBadge(unlockState.shouldShowArcadeBadge);
      setShowB4UnlockModal(unlockState.shouldShowModal);
    };

    refreshUnlockState();
    window.addEventListener(B4_FOCUS_FLIGHT_UNLOCK_EVENT, refreshUnlockState);
    window.addEventListener('storage', refreshUnlockState);
    return () => {
      window.removeEventListener(B4_FOCUS_FLIGHT_UNLOCK_EVENT, refreshUnlockState);
      window.removeEventListener('storage', refreshUnlockState);
    };
  }, [session, showLoaderOverlay]);

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
        stayInShell: true,
        resumePayload: {
          route: location.pathname + location.search,
          module: (resolveKidPlayShellModule(location.pathname) ?? 'weekly-adventures') as KidPlayShellModuleId,
          endedFrom: reason === 'user_exit' ? 'kid_play_shell_exit' : 'kid_play_shell_idle',
        },
      }).then(() => {
        setReturnSessionOpen(true);
      });
    },
    [displayName, location.pathname, location.search, navigate, session],
  );

  const handleConfirmExit = useCallback(() => {
    setExitOpen(false);
    handleEndSession('user_exit');
  }, [handleEndSession]);

  const handleB4UnlockDismiss = useCallback(() => {
    markB4FocusFlightUnlockSeen(session?.child_id);
    setShowB4UnlockModal(false);
    setShowArcadeNewBadge(getB4FocusFlightUnlockState(session?.child_id).shouldShowArcadeBadge);
  }, [session?.child_id]);

  const handleB4UnlockPlayNow = useCallback(() => {
    if (!session) return;
    markB4FocusFlightUnlockSeen(session.child_id);
    requestB4FocusFlightHighlight(session.child_id);
    setShowB4UnlockModal(false);
    setShowArcadeNewBadge(false);
    kidPlayShellNavigate(navigate, `${getKidPlayShellRoute(session.id, 'arcade')}?launch=b4-focus-flight`);
  }, [navigate, session]);

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
          gradeLevel={gradeLevel}
        >
          <KidPlaySessionProvider session={session}>
            <MyAdventuresProvider participantId={session.child_id}>
            <B4UnitOnboardingModal
              key={session.child_id}
              participantId={session.child_id}
              enforce
            />
            <KidPlayMyAdventures
              participantId={session.child_id}
              displayName={displayName}
              sessionId={session.id}
            />
            <div className="kid-play-shell">
              <KidPlayShellNav
                sessionId={session.id}
                activeModule={activeModule}
                participantId={session.child_id}
                displayName={displayName}
                showArcadeNewBadge={showArcadeNewBadge}
                onExitClick={() => setExitOpen(true)}
              />
              <Suspense fallback={null}>
                <Outlet />
              </Suspense>
              <KidPlayShellExitModal
                open={exitOpen}
                onCancel={() => setExitOpen(false)}
                onConfirm={handleConfirmExit}
              />
              <IdleSessionGuard
                enabled={!returnSessionOpen && !isKidPlayFamilySoftLocked()}
                onEndSession={() => handleEndSession('idle_timeout')}
                endSessionLabel="End Session"
              />
              <KidPlayFamilySoftLockGate
                open={returnSessionOpen || isKidPlayFamilySoftLocked()}
                inShellChildId={session.child_id}
                inShellSessionId={session.id}
                onUnlocked={() => setReturnSessionOpen(false)}
              />
              <B4FocusFlightUnlockModal
                open={showB4UnlockModal}
                onPlayNow={handleB4UnlockPlayNow}
                onDismiss={handleB4UnlockDismiss}
              />
              </div>
            </MyAdventuresProvider>
          </KidPlaySessionProvider>
        </KidPlaySessionParticipantProvider>
      ) : null}
      {showLoaderOverlay ? (
        <KidPlayShellLoader fullScreen exiting={!isBooting && bootLoaderExiting} />
      ) : null}
    </>
  );
}
