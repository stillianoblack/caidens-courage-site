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
  onLockedClick?: () => void;
  onShopCtaClick?: () => void;
};

function resolveShopCta(state: InventoryShopState | undefined, disabled: boolean): string | null {
  if (state === 'owned') return 'Owned';
  if (state === 'need_coins') return 'Earn more coins';
  if (state === 'locked' || disabled) return 'Locked';
  if (state === 'available') return 'Unlock';
  return null;
}

function resolveFallbackIcon(
  variant: InventoryItemCardProps['variant'],
): 'badge' | 'gift' | 'flame' {
  if (variant === 'badge') return 'badge';
  if (variant === 'shop') return 'gift';
  return 'flame';
}

export default function InventoryItemCard({
  label,
  imageSrc,
  variant = 'item',
  cost,
  description,
  disabled = false,
  themeHint,
  owned = false,
  locked = false,
  unlockRequirement,
  rarity = 'Common',
  category,
  shopState,
  onLockedClick,
  onShopCtaClick,
}: InventoryItemCardProps) {
  const themeId = resolveCharacterThemeId(themeHint ?? label);
  const themeAttrs = themeId ? themeDataAttributes(themeId) : {};
  const shopCta = resolveShopCta(shopState, disabled);
  const showOwned = owned && !locked && variant !== 'shop';
  const showLocked = locked && variant === 'badge';
  const isShop = variant === 'shop';
  const isInteractiveLockedBadge = showLocked && Boolean(onLockedClick);
  const isShopInteractive =
    isShop &&
    Boolean(onShopCtaClick) &&
    (shopState === 'available' || shopState === 'need_coins');
  const hasImage = Boolean(imageSrc?.trim());

  const className = [
    'kidInventoryCard',
    `kidInventoryCard--${variant}`,
    disabled ? 'kidInventoryCard--disabled' : '',
    showOwned ? 'kidInventoryCard--owned' : '',
    showLocked ? 'kidInventoryCard--locked' : '',
    shopState ? `kidInventoryCard--shopState-${shopState}` : '',
    isInteractiveLockedBadge ? 'kidInventoryCard--lockedInteractive' : '',
    isShopInteractive ? 'kidInventoryCard--shopInteractive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const artBlock = (
    <div className="kidInventoryCardArtWrap">
      {hasImage ? (
        <img
          src={imageSrc ?? undefined}
          alt=""
          className={['kidInventoryCardArt', showLocked ? 'kidInventoryCardArt--locked' : ''].filter(Boolean).join(' ')}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="kidInventoryCardFallback" aria-hidden="true">
          <KidsAdventureIcon name={resolveFallbackIcon(variant)} size={32} filled />
        </span>
      )}
    </div>
  );

  const bodyContent = (
    <>
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

      {artBlock}

      {variant === 'badge' || isShop ? (
        <span className="kidInventoryCardRarity">{rarity}</span>
      ) : null}

      <p className="kidInventoryCardLabel">{label}</p>

      {showLocked ? <p className="kidInventoryCardLockedLabel">Locked</p> : null}

      {category ? <p className="kidInventoryCardCategory">{category}</p> : null}

      {unlockRequirement ? <p className="kidInventoryCardDesc">{unlockRequirement}</p> : null}

      {description && !unlockRequirement ? (
        <p className="kidInventoryCardDesc">{description}</p>
      ) : null}
    </>
  );

  const shopFooter =
    isShop && (typeof cost === 'number' || shopCta) ? (
      <footer className="kidInventoryCardFooter">
        {typeof cost === 'number' ? (
          <p className="kidInventoryCardCost">
            <KidsAdventureIcon name="coin" size={14} />
            {cost}
          </p>
        ) : null}
        {shopCta ? <span className="kidInventoryCardShopCta">{shopCta}</span> : null}
      </footer>
    ) : null;

  const content = isShop ? (
    <>
      <div className="kidInventoryCardBody">{bodyContent}</div>
      {shopFooter}
    </>
  ) : (
    <>
      {bodyContent}
      {typeof cost === 'number' ? (
        <p className="kidInventoryCardCost">
          <KidsAdventureIcon name="coin" size={14} />
          {cost} Focus Coins
        </p>
      ) : null}
      {shopCta ? <span className="kidInventoryCardShopCta">{shopCta}</span> : null}
    </>
  );

  if (isInteractiveLockedBadge) {
    return (
      <button
        type="button"
        className={className}
        onClick={onLockedClick}
        aria-label={`${label} locked. ${unlockRequirement ?? 'Tap for guidance.'}`}
        {...themeAttrs}
      >
        {content}
      </button>
    );
  }

  if (isShopInteractive) {
    return (
      <button
        type="button"
        className={className}
        onClick={onShopCtaClick}
        aria-label={`${label}. ${shopCta ?? 'Shop item'}.`}
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
