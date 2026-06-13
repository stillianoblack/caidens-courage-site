import React from 'react';
import { readActiveChildNickname } from '../../config/activeChildNickname';
import { readActiveChildState } from '../../lib/activeChildContext';
import FocusCoinWalletBadge from '../rewards/FocusCoinWalletBadge';

export default function FamilyPortalMobileHeaderChips() {
  const activeChild = readActiveChildState();
  const displayName = activeChild?.displayName ?? readActiveChildNickname() ?? 'Player';

  return (
    <div className="family-portalMobileChips" aria-label="Player status">
      <FocusCoinWalletBadge compact className="family-portalMobileChip" />
      <span className="family-portalMobilePlayerChip" title="Active player">
        <span className="family-portalMobilePlayerAvatar" aria-hidden="true">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="family-portalMobilePlayerName">{displayName}</span>
      </span>
    </div>
  );
}
