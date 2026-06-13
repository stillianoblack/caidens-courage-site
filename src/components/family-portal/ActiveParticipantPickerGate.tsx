import React from 'react';
import { useLocation } from 'react-router-dom';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import { isKidFacingPortalRoute } from '../../lib/kidFacingPortalRoutes';
import { isMobileFamilyGameplayShellRoute } from '../../lib/familyPortalNav';
import ActiveParticipantPickerModal from './ActiveParticipantPickerModal';
import './active-participant-picker.css';

function isGameplayPickerRoute(pathname: string): boolean {
  if (isMobileFamilyGameplayShellRoute(pathname)) return true;
  if (!isKidFacingPortalRoute(pathname)) return false;
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? '';
  return [
    'weekly-adventures',
    'characters',
    'inventory',
    'baseline-check',
    'continue-learning',
  ].includes(last);
}

export default function ActiveParticipantPickerGate() {
  const location = useLocation();
  const { roster, needsSelection, loading, selectParticipant } = useActiveParticipant();

  const shouldPrompt =
    !loading &&
    needsSelection &&
    roster.length > 1 &&
    isGameplayPickerRoute(location.pathname);

  return (
    <ActiveParticipantPickerModal
      open={shouldPrompt}
      roster={roster}
      onSelect={selectParticipant}
    />
  );
}
