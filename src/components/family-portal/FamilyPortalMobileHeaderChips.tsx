import React from 'react';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import FocusCoinWalletBadge from '../rewards/FocusCoinWalletBadge';

export default function FamilyPortalMobileHeaderChips() {
  const { playerLabel, hasActiveParticipant } = useActiveParticipant();
  const displayName = hasActiveParticipant ? playerLabel : 'Choose Player';
  const avatarLetter = hasActiveParticipant
    ? displayName.replace(/^([^·]+).*/, '$1').trim().charAt(0).toUpperCase() || 'P'
    : '?';

  return (
    <div className="family-portalMobileChips" aria-label="Player status">
      <FocusCoinWalletBadge compact className="family-portalMobileChip" />
      <span className="family-portalMobilePlayerChip" title={displayName}>
        <span className="family-portalMobilePlayerAvatar" aria-hidden="true">
          {avatarLetter}
        </span>
        <span className="family-portalMobilePlayerName">{displayName}</span>
      </span>
    </div>
  );
}
