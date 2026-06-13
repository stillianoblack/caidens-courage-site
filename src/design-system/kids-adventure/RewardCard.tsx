import React from 'react';
import KidsAdventureIcon from './KidsAdventureIcon';
import {
  resolveCharacterThemeId,
  themeDataAttributes,
  type CharacterThemeId,
} from './characterThemes';

type RewardCardProps = {
  label: string;
  value?: string | number;
  imageSrc?: string | null;
  variant?: 'badge' | 'coins' | 'item' | 'gift';
  themeId?: CharacterThemeId | string | null;
  className?: string;
};

export default function RewardCard({
  label,
  value,
  imageSrc,
  variant = 'badge',
  themeId,
  className,
}: RewardCardProps) {
  const resolvedTheme = resolveCharacterThemeId(themeId ?? null);
  const themeAttrs = resolvedTheme ? themeDataAttributes(resolvedTheme) : {};
  const fallbackIcon =
    variant === 'coins' ? 'coin' : variant === 'gift' ? 'gift' : 'badge';

  return (
    <article
      className={[
        'kidRewardCard',
        `kidRewardCard--${variant}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...themeAttrs}
    >
      <p className="kidRewardCardLabel">{label}</p>
      <div className="kidRewardCardArtWrap">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="kidRewardCardArt" loading="lazy" decoding="async" />
        ) : (
          <span className="kidRewardCardFallback" aria-hidden="true">
            <KidsAdventureIcon name={fallbackIcon} size={32} />
          </span>
        )}
      </div>
      {value !== undefined ? <p className="kidRewardCardValue">{value}</p> : null}
    </article>
  );
}
