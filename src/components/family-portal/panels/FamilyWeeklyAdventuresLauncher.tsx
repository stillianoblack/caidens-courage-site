import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PortalRouteLoader from '../../portal/PortalRouteLoader';
import { useToast } from '../../portal-design-system/ToastProvider';
import { useActiveParticipant } from '../../../hooks/useActiveParticipant';
import { launchFamilyKidPlay } from '../../../lib/launchFamilyKidPlay';
import { familySettingsTabPath } from '../../../lib/familyPortalPaths';
import ActiveParticipantPickerModal from '../ActiveParticipantPickerModal';
import type { ActiveParticipantRosterEntry } from '../../../types/activeParticipant';
import { PORTAL_PATH } from '../../../config/courageRoutes';

/**
 * Family Portal entry for Weekly Adventures — launches Kid Shell instead of the
 * parent-facing adventure dashboard.
 */
export default function FamilyWeeklyAdventuresLauncher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const {
    roster,
    loading,
    needsSelection,
    participantId,
    selectParticipant,
    refreshParticipant,
  } = useActiveParticipant();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Starting Weekly Adventures…');
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [pendingChildId, setPendingChildId] = useState('');
  const launchStartedRef = useRef(false);

  const returnHome = useCallback(() => {
    navigate(PORTAL_PATH, { replace: true });
  }, [navigate]);

  const tryLaunch = useCallback(
    async (childId: string) => {
      setStatusMessage('Starting Weekly Adventures…');
      setLaunchError(null);
      setPendingChildId(childId);
      const result = await launchFamilyKidPlay({
        childId,
        returnPath: location.pathname,
        navigate,
      });
      if (!result.ok) {
        setLaunchError(result.message);
        showToast(result.message, 'error');
      }
    },
    [location.pathname, navigate, showToast],
  );

  const handlePickerSelect = useCallback(
    (entry: ActiveParticipantRosterEntry) => {
      selectParticipant(entry);
      refreshParticipant();
      setPickerOpen(false);
      launchStartedRef.current = true;
      void tryLaunch(entry.participantId);
    },
    [refreshParticipant, selectParticipant, tryLaunch],
  );

  useEffect(() => {
    if (loading || launchStartedRef.current) return;

    if (roster.length === 0) {
      launchStartedRef.current = true;
      showToast('Add a child profile before starting Weekly Adventures.', 'info');
      navigate(familySettingsTabPath('children', location.pathname), { replace: true });
      return;
    }

    if (needsSelection && roster.length > 1) {
      setPickerOpen(true);
      setStatusMessage('Choose a player to continue…');
      return;
    }

    const childId = participantId.trim() || roster[0]?.participantId?.trim() || '';
    if (!childId) {
      launchStartedRef.current = true;
      showToast('Add a child profile before starting Weekly Adventures.', 'info');
      navigate(familySettingsTabPath('children', location.pathname), { replace: true });
      return;
    }

    launchStartedRef.current = true;
    void tryLaunch(childId);
  }, [
    loading,
    location.pathname,
    navigate,
    needsSelection,
    participantId,
    roster,
    showToast,
    tryLaunch,
  ]);

  return (
    <>
      {launchError ? (
        <section className="family-panel family-launchError" role="alert">
          <h2>Couldn&apos;t start this adventure.</h2>
          <p>{launchError}</p>
          <div className="family-launchErrorActions">
            <button type="button" className="family-nextCta" onClick={() => void tryLaunch(pendingChildId)}>
              Try Again
            </button>
            <button type="button" className="family-nextCta family-nextCta--ghost" onClick={returnHome}>
              Switch Program
            </button>
          </div>
        </section>
      ) : <PortalRouteLoader message={statusMessage} academy />}
      <ActiveParticipantPickerModal
        open={pickerOpen}
        roster={roster}
        onSelect={handlePickerSelect}
      />
    </>
  );
}
