import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PortalRouteLoader from '../../portal/PortalRouteLoader';
import { useToast } from '../../portal-design-system/ToastProvider';
import { useActiveParticipant } from '../../../hooks/useActiveParticipant';
import { launchFamilyKidPlay } from '../../../lib/launchFamilyKidPlay';
import { familySettingsTabPath, resolveFamilyPortalBase } from '../../../lib/familyPortalPaths';
import ActiveParticipantPickerModal from '../ActiveParticipantPickerModal';
import type { ActiveParticipantRosterEntry } from '../../../types/activeParticipant';

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
  const launchStartedRef = useRef(false);

  const returnHome = useCallback(() => {
    navigate(resolveFamilyPortalBase(location.pathname), { replace: true });
  }, [location.pathname, navigate]);

  const tryLaunch = useCallback(
    async (childId: string) => {
      setStatusMessage('Starting Weekly Adventures…');
      const result = await launchFamilyKidPlay({
        childId,
        returnPath: location.pathname,
        navigate,
      });
      if (!result.ok) {
        showToast(
          result.supportCode ? `${result.message} Support code: ${result.supportCode}` : result.message,
          'error',
        );
        returnHome();
      }
    },
    [location.pathname, navigate, returnHome, showToast],
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
      <PortalRouteLoader message={statusMessage} academy />
      <ActiveParticipantPickerModal
        open={pickerOpen}
        roster={roster}
        onSelect={handlePickerSelect}
      />
    </>
  );
}
