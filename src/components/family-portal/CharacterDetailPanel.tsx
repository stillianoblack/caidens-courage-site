import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { ResolvedCharacterProfile } from '../../data/characterProfiles';
import type { CharacterRewardProgress } from '../../lib/characterRewardProgress';
import type { CharacterUnlockMore } from '../../lib/characterUnlockMore';
import { appendCharacterHubGameContext } from '../../lib/weeklyAdventureRouteContext';
import CharacterUnlockMoreRow from './CharacterUnlockMoreRow';
import './character-detail-panel.css';

type CharacterDetailPanelProps = {
  profile: ResolvedCharacterProfile;
  variant: 'inspector' | 'sheet';
  open: boolean;
  onClose: () => void;
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
    <div className="characterDetailScanRow">
      <span className="characterDetailScanEmoji" aria-hidden="true">{emoji}</span>
      <div className="characterDetailScanCopy">
        <span className="characterDetailScanLabel">{label}</span>
        <span className="characterDetailScanValue">{value}</span>
      </div>
    </div>
  );
}

export default function CharacterDetailPanel({
  profile,
  variant,
  open,
  onClose,
  rewardProgress,
  unlockMore,
}: CharacterDetailPanelProps) {
  useEffect(() => {
    if (!open || variant !== 'sheet') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, variant]);

  if (!open) return null;

  const panelClass = [
    'characterDetailPanel',
    `characterDetailPanel--${variant}`,
    `characterDetailPanel--${profile.theme}`,
  ].join(' ');

  const missionHref = profile.missionsAvailable
    ? appendCharacterHubGameContext(profile.missionsPath)
    : null;

  const panel = (
    <aside className={panelClass} aria-label={`${profile.name} details`}>
      <header className="characterDetailHeader">
        <button
          type="button"
          className="characterDetailClose"
          onClick={onClose}
          aria-label="Close character details"
        >
          ×
        </button>
      </header>

      <div className="characterDetailBody">
        <div
          className={`characterDetailPortrait characterDetailPortrait--${profile.theme}`}
          aria-hidden="true"
        >
          {profile.imageSrc ? (
            <img
              src={profile.imageSrc}
              alt=""
              className="characterDetailPortraitImage"
              width={150}
              height={150}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="characterDetailPortraitFallback">{profile.name.charAt(0)}</span>
          )}
        </div>

        <h2 className="characterDetailName">{profile.name}</h2>
        <p className="characterDetailTagline">{profile.tagline}</p>

        <ScanSection emoji="⚡" label="Powers" value={profile.powers.join(' · ')} />
        <ScanSection emoji="🎮" label="Loves" value={profile.loves.join(' · ')} />
        <ScanSection emoji="🏆" label="Teaches" value={profile.teaches} />

        <div className="characterDetailReward" aria-label="Next reward">
          <span className="characterDetailRewardLabel">Next Reward</span>
          <p className="characterDetailRewardMissions">{rewardProgress.missionsRemainingText}</p>
          <p className="characterDetailRewardUnlock">
            Unlock: {rewardProgress.unlockLabel}
          </p>
        </div>

        <CharacterUnlockMoreRow unlock={unlockMore} theme={profile.theme} />
      </div>

      {missionHref ? (
        <div className="characterDetailActions">
          <Link
            to={missionHref}
            className={`characterDetailCta characterDetailCta--${profile.theme}`}
          >
            Start Mission
          </Link>
        </div>
      ) : null}
    </aside>
  );

  if (variant === 'sheet') {
    const sheet = (
      <div className="characterDetailSheetRoot" role="presentation">
        <button
          type="button"
          className="characterDetailBackdrop"
          aria-label="Close character details"
          onClick={onClose}
        />
        {panel}
      </div>
    );
    return createPortal(sheet, document.body);
  }

  return panel;
}
