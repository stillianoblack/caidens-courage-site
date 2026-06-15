import React from 'react';
import KidsAdventureIcon from './KidsAdventureIcon';
import { resolveCharacterThemeId, themeDataAttributes } from './characterThemes';

export type InventoryCardRarity = 'Common' | 'Rare' | 'Epic';
export type InventoryShopState = 'available' | 'owned' | 'locked' | 'need_coins';

type InventoryItemCardProps = {
  label: string;
  imageSrc?: string | null;
  variant?: 'badge' | 'item' | 'sticker' | 'decoration' | 'shop';
  cost?: number;
  description?: string;
  disabled?: boolean;
  themeHint?: string | null;
  owned?: boolean;
  locked?: boolean;
  unlockRequirement?: string;
  rarity?: InventoryCardRarity;
  category?: string;
  shopState?: InventoryShopState;
};

function resolveShopCta(state: InventoryShopState | undefined, disabled: boolean): string | null {
  if (state === 'owned') return 'Owned';
  if (state === 'need_coins') return 'Need More Coins';
  if (state === 'locked' || disabled) return 'Locked';
  if (state === 'available') return 'Unlock';
  return null;
}

export default function InventoryItemCard({
  label,
  imageSrc,
  variant = 'item',
  cost,
  description,
  disabled = false,
  themeHint,
  owned = variant !== 'shop',
  locked = false,
  unlockRequirement,
  rarity = 'Common',
  category,
  shopState,
  }: InventoryItemCardProps) {
  const themeId = resolveCharacterThemeId(themeHint ?? label);
  const themeAttrs = themeId ? themeDataAttributes(themeId) : {};
  const shopCta = resolveShopCta(shopState, disabled);
  const showOwned = owned && !locked && variant !== 'shop';
  const showLocked = locked && variant === 'badge';

  return (
    <article
      className={[
        'kidInventoryCard',
        `kidInventoryCard--${variant}`,
        disabled ? 'kidInventoryCard--disabled' : '',
        showOwned ? 'kidInventoryCard--owned' : '',
        showLocked ? 'kidInventoryCard--locked' : '',
        shopState ? `kidInventoryCard--shopState-${shopState}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...themeAttrs}
    >
      {showOwned ? (
        <span className="kidInventoryCardOwnedMark" aria-label="Owned">
          <KidsAdventureIcon name="check" size={14} filled />
        </span>
      ) : null}

      {showLocked ? (
        <span className="kidInventoryCardLockedMark" aria-label="Locked">
          <KidsAdventureIcon name="lock" size={14} filled />
        </span>
      ) : null}

      <div className="kidInventoryCardArtWrap">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className={['kidInventoryCardArt', showLocked ? 'kidInventoryCardArt--locked' : ''].filter(Boolean).join(' ')}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="kidInventoryCardFallback" aria-hidden="true">
            <KidsAdventureIcon
              name={variant === 'badge' ? 'badge' : variant === 'shop' ? 'gift' : 'flame'}
              size={32}
              filled
            />
          </span>
        )}
      </div>

      {variant === 'badge' || variant === 'shop' ? (
        <span className="kidInventoryCardRarity">{rarity}</span>
      ) : null}

      <p className="kidInventoryCardLabel">{label}</p>

      {showLocked ? <p className="kidInventoryCardLockedLabel">Locked</p> : null}

      {category ? <p className="kidInventoryCardCategory">{category}</p> : null}

      {unlockRequirement ? <p className="kidInventoryCardDesc">{unlockRequirement}</p> : null}

      {description && !unlockRequirement ? <p className="kidInventoryCardDesc">{description}</p> : null}

      {typeof cost === 'number' ? (
        <p className="kidInventoryCardCost">
          <KidsAdventureIcon name="coin" size={14} />
          {cost} Focus Coins
        </p>
      ) : null}

      {shopCta ? <span className="kidInventoryCardShopCta">{shopCta}</span> : null}
    </article>
  );
}
