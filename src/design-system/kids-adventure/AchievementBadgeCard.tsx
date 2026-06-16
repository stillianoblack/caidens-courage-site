import React from 'react';
import KidsAdventureIcon from './KidsAdventureIcon';
import { resolveBadgeFrameShape, type BadgeFrameShape } from '../../lib/badgeFrameArtwork';
import { GENERIC_BADGE_PLACEHOLDER_SRC } from '../../lib/weeklyRewardDisplay';
import { resolveCharacterThemeId, themeDataAttributes } from './characterThemes';
import './achievement-badge.css';

export type AchievementBadgeCardProps = {
  label: string;
  kind: 'check-in' | 'weekly' | 'monthly';
  weekNumber: number | null;
  imageSrc?: string | null;
  frameShape?: BadgeFrameShape;
  earned: boolean;
  locked: boolean;
  category?: string;
  themeHint?: string | null;
  onLockedClick?: () => void;
  onEarnedClick?: () => void;
};

export default function AchievementBadgeCard({
  label,
  kind,
  weekNumber,
  imageSrc,
  frameShape,
  earned,
  locked,
  category,
  themeHint,
  onLockedClick,
  onEarnedClick,
}: AchievementBadgeCardProps) {
  const resolvedFrame = frameShape ?? resolveBadgeFrameShape(kind, weekNumber);
  const rewardImageUrl = imageSrc?.trim() || null;
  const themeId = resolveCharacterThemeId(themeHint ?? label);
  const themeAttrs = themeId ? themeDataAttributes(themeId) : {};
  const isInteractive =
    (locked && Boolean(onLockedClick)) || (earned && Boolean(onEarnedClick));

  const className = [
    'achievementBadge',
    `achievementBadge--${resolvedFrame}`,
    earned ? 'achievementBadge--earned' : '',
    locked ? 'achievementBadge--locked' : '',
    isInteractive ? 'achievementBadge--interactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <div className="achievementBadgeFrame" aria-hidden="true">
        <div className="achievementBadgeFrameRing" />
        <div className="achievementBadgeRewardWrap">
          {rewardImageUrl ? (
            <img
              src={rewardImageUrl}
              alt=""
              className="achievementBadgeRewardImage"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="achievementBadgePlaceholder" aria-hidden="true">
              <img
                src={GENERIC_BADGE_PLACEHOLDER_SRC}
                alt=""
                className="achievementBadgeRewardImage achievementBadgeRewardImage--placeholder"
              />
            </span>
          )}
        </div>
        {locked ? (
          <span className="achievementBadgeLockMark">
            <KidsAdventureIcon name="lock" size={16} filled />
          </span>
        ) : null}
        {earned ? (
          <span className="achievementBadgeEarnedMark" aria-label="Earned">
            <KidsAdventureIcon name="check" size={12} filled />
          </span>
        ) : null}
      </div>

      <p className="achievementBadgeLabel">{label}</p>
      {category ? <p className="achievementBadgeCategory">{category}</p> : null}
    </>
  );

  if (isInteractive) {
    const handleClick = locked ? onLockedClick : onEarnedClick;
    return (
      <button
        type="button"
        className={className}
        onClick={handleClick}
        aria-label={
          locked
            ? `${label} locked. Go to ${category ?? 'adventure'}.`
            : `${label} earned. View badge details.`
        }
        {...themeAttrs}
      >
        {content}
      </button>
    );
  }

  return (
    <article className={className} {...themeAttrs}>
      {content}
    </article>
  );
}
