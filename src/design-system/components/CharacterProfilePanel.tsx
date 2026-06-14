import React, { memo } from 'react';
import CharacterProfileSheet from './CharacterProfileSheet';
import type { ResolvedCharacterProfile } from '../../data/characterProfiles';
import type { CharacterRewardProgress } from '../../lib/characterRewardProgress';
import type { CharacterUnlockMore } from '../../lib/characterUnlockMore';
import CharacterProfilePanelContent from './CharacterProfilePanelContent';
import './character-sheet-panel.css';
import './character-profile-sheet.css';
import './character-profile-panel.css';

export type CharacterProfilePanelProps = {
  profile: ResolvedCharacterProfile;
  open: boolean;
  onClose: () => void;
  rewardProgress: CharacterRewardProgress;
  unlockMore: CharacterUnlockMore;
};

/** Character Hub profile — narrow CharacterProfileSheet for all character bios. */
export default memo(function CharacterProfilePanel({
  profile,
  open,
  onClose,
  rewardProgress,
  unlockMore,
}: CharacterProfilePanelProps) {
  return (
    <CharacterProfileSheet
      open={open}
      onClose={onClose}
      titleId="character-profile-title"
      panelClassName={`characterSheetPanel--${profile.theme}`}
      closeLabel={`Close ${profile.name} profile`}
    >
      <CharacterProfilePanelContent
        profile={profile}
        rewardProgress={rewardProgress}
        unlockMore={unlockMore}
      />
    </CharacterProfileSheet>
  );
});
