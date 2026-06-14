import React from 'react';
import { Link } from 'react-router-dom';
import type { ResolvedCharacterProfile } from '../../data/characterProfiles';
import type { CharacterRewardProgress } from '../../lib/characterRewardProgress';
import type { CharacterUnlockMore } from '../../lib/characterUnlockMore';
import { appendCharacterHubGameContext } from '../../lib/weeklyAdventureRouteContext';
import CharacterUnlockMoreRow from '../../components/family-portal/CharacterUnlockMoreRow';
import '../../components/family-portal/character-detail-panel.css';
import './character-sheet-panel.css';
import './character-profile-panel.css';

export type CharacterProfilePanelContentProps = {
  profile: ResolvedCharacterProfile;
  rewardProgress: CharacterRewardProgress;
  unlockMore: CharacterUnlockMore;
};

function ScanSection({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <div className="characterSheetScanRow">
      <span className="characterSheetScanEmoji" aria-hidden="true">
        {emoji}
      </span>
      <div className="characterSheetScanCopy">
        <span className="characterSheetScanLabel">{label}</span>
        <span className="characterSheetScanValue">{value}</span>
      </div>
    </div>
  );
}

export function CharacterProfilePanelContent({
  profile,
  rewardProgress,
  unlockMore,
}: CharacterProfilePanelContentProps) {
  const missionHref = profile.missionsAvailable
    ? appendCharacterHubGameContext(profile.missionsPath)
    : null;

  return (
    <div className={`characterSheetPanelInner characterSheetPanelInner--${profile.theme}`}>
      <header className="characterProfileHero">
        <div className={`characterProfileHeroCover characterProfileHeroCover--${profile.theme}`}>
          {profile.coverImageSrc ? (
            <img
              className="characterProfileHeroCoverImage"
              src={profile.coverImageSrc}
              alt=""
              decoding="async"
              loading="lazy"
            />
          ) : null}
          <div className="characterProfileHeroOverlay" aria-hidden="true" />
        </div>

        <div className="characterProfileHeroBar">
          <div
            className={`characterProfilePortrait characterDetailPortrait characterDetailPortrait--${profile.theme}`}
            aria-hidden="true"
          >
            {profile.imageSrc ? (
              <img
                src={profile.imageSrc}
                alt=""
                className="characterDetailPortraitImage characterProfilePortraitImage"
                width={150}
                height={150}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="characterDetailPortraitFallback">{profile.name.charAt(0)}</span>
            )}
          </div>

          <h2 id="character-profile-title" className="characterProfileName">
            {profile.name}
          </h2>
          <p className="characterProfileTagline">{profile.tagline}</p>
        </div>
      </header>

      <div className="characterSheetPanelScroll">
        <div className="characterSheetPanelBody">
          <ScanSection emoji="⚡" label="Powers" value={profile.powers.join(' · ')} />
          <ScanSection emoji="🎮" label="Loves" value={profile.loves.join(' · ')} />
          <ScanSection emoji="🏆" label="Teaches" value={profile.teaches} />
          <ScanSection emoji="✨" label="Special Trait" value={profile.specialTrait} />

          <div className="characterDetailReward" aria-label="Next reward">
            <span className="characterDetailRewardLabel">Next Reward</span>
            <p className="characterDetailRewardMissions">{rewardProgress.missionsRemainingText}</p>
            <p className="characterDetailRewardUnlock">Unlock: {rewardProgress.unlockLabel}</p>
          </div>

          <CharacterUnlockMoreRow unlock={unlockMore} theme={profile.theme} />
        </div>
      </div>

      {missionHref ? (
        <footer className="characterSheetPanelFooter characterProfileFooter">
          <Link
            to={missionHref}
            className={`characterDetailCta characterDetailCta--${profile.theme}`}
          >
            Start Mission
          </Link>
        </footer>
      ) : null}
    </div>
  );
}

export default CharacterProfilePanelContent;
