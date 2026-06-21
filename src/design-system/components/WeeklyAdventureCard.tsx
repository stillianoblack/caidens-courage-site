import React, { useRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import type { FamilyCharacterId } from '../../data/familyPortalContent';
import { CHARACTER_ASSETS } from '../../data/familyPortalContent';
import {
  getCharacterTheme,
  resolveCharacterThemeId,
  resolveHotspotImage,
} from '../kids-adventure/characterThemes';
import ZekePlaceholderAvatar from './ZekePlaceholderAvatar';
import './weekly-adventure-card.css';

export type WeeklyAdventureCardKind = 'game' | 'download' | 'activity';

export type WeeklyAdventureCardProps = {
  character?: FamilyCharacterId | 'download' | 'activity';
  title: string;
  description: string;
  weekLabel?: string;
  skillTags?: string;
  cta: string;
  status?: string;
  accentColor?: string;
  avatarSrc?: string | null;
  href: string;
  locked?: boolean;
  softLocked?: boolean;
  featured?: boolean;
  startHereLabel?: string;
  lockedLabel?: string;
  kind?: WeeklyAdventureCardKind;
  external?: boolean;
  linkState?: LinkProps['state'];
  className?: string;
  /** When set, card activates in place instead of navigating (Character Hub meet panel). */
  onActivate?: () => void;
};

function resolveThemeClass(character?: WeeklyAdventureCardProps['character'], kind?: WeeklyAdventureCardKind) {
  if (character && character !== 'download' && character !== 'activity') {
    return `weeklyAdventureCard--${character}`;
  }
  if (kind === 'download') return 'weeklyAdventureCard--download';
  if (kind === 'activity') return 'weeklyAdventureCard--activity';
  return '';
}

function CardAvatar({
  character,
  kind = 'game',
  avatarSrc,
}: {
  character?: WeeklyAdventureCardProps['character'];
  kind?: WeeklyAdventureCardKind;
  avatarSrc?: string | null;
}) {
  const resolvedSrc =
    avatarSrc !== undefined
      ? avatarSrc
      : character && character !== 'download' && character !== 'activity'
        ? CHARACTER_ASSETS[character]?.imageSrc
        : null;

  if (character === 'zeke' && !resolvedSrc) {
    return <ZekePlaceholderAvatar />;
  }

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt=""
        className="weeklyAdventureCardAvatar"
        width={56}
        height={56}
        loading="lazy"
      />
    );
  }

  const fallbackLabel = kind === 'download' ? '↓' : kind === 'activity' ? '★' : '•';

  return (
    <div
      className={[
        'weeklyAdventureCardAvatar',
        'weeklyAdventureCardAvatar--fallback',
        kind === 'download' ? 'weeklyAdventureCardAvatar--download' : '',
        kind === 'activity' ? 'weeklyAdventureCardAvatar--activity' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      {fallbackLabel}
    </div>
  );
}

export default function WeeklyAdventureCard({
  character,
  title,
  description,
  weekLabel,
  skillTags,
  cta,
  status,
  accentColor,
  avatarSrc,
  href,
  locked = false,
  softLocked = false,
  featured = false,
  startHereLabel,
  lockedLabel = 'Complete B-4 Check-In to unlock',
  kind = 'game',
  external,
  linkState,
  className,
  onActivate,
}: WeeklyAdventureCardProps) {
  const ignoreNextClickRef = useRef(false);
  const themeClass = resolveThemeClass(character, kind);
  const themeId = character && character !== 'download' && character !== 'activity'
    ? resolveCharacterThemeId(character)
    : null;
  const stripStyle = accentColor
    ? { background: accentColor }
    : themeId
      ? { background: getCharacterTheme(themeId).stripGradient }
      : undefined;
  const isExternal = external ?? (href.startsWith('/downloads') || href.startsWith('http'));
  const isBlocked = locked || softLocked;
  const displayCta = isBlocked ? lockedLabel : cta;
  const footerPill = startHereLabel ?? weekLabel ?? (!isBlocked && status ? status : undefined);
  const cardImageSrc =
    avatarSrc !== undefined && avatarSrc !== null
      ? avatarSrc
      : themeId
        ? resolveHotspotImage(themeId)
        : character && character !== 'download' && character !== 'activity'
          ? CHARACTER_ASSETS[character]?.imageSrc
          : null;
  const cardSurfaceStyle: React.CSSProperties | undefined = cardImageSrc
    ? ({ '--kid-card-image': `url("${cardImageSrc}")`, touchAction: 'manipulation' } as React.CSSProperties)
    : { touchAction: 'manipulation' };
  const cardSurfaceAttrs = {
    'data-kid-theme': themeId ?? undefined,
    style: cardSurfaceStyle,
  };

  const content = (
    <>
      <div
        className="weeklyAdventureCardStrip"
        aria-hidden="true"
        style={stripStyle}
      />
      <div className="weeklyAdventureCardMain">
        <CardAvatar character={character} kind={kind} avatarSrc={avatarSrc} />
        <div className="weeklyAdventureCardText">
          {startHereLabel ? (
            <span className="weeklyAdventureCardStartHere">{startHereLabel}</span>
          ) : null}
          <h3 className="weeklyAdventureCardTitle">{title}</h3>
          <p className="weeklyAdventureCardDesc">{description}</p>
          {skillTags ? <p className="weeklyAdventureCardTags">{skillTags}</p> : null}
        </div>
        <div className="weeklyAdventureCardFoot">
          {footerPill ? (
            <span className="weeklyAdventureCardWeekLabel">{footerPill}</span>
          ) : (
            <span className="weeklyAdventureCardFootSpacer" aria-hidden="true" />
          )}
          <span className="weeklyAdventureCardCta">
            {displayCta}
            {!isBlocked ? <span aria-hidden="true">→</span> : null}
          </span>
        </div>
      </div>
      {softLocked ? (
        <span className="weeklyAdventureCardSoftLock" aria-hidden="true">
          🔒 Locked
        </span>
      ) : null}
    </>
  );

  const cardClass = [
    'weeklyAdventureCard',
    themeClass,
    locked ? 'weeklyAdventureCard--locked' : '',
    softLocked ? 'weeklyAdventureCard--softLocked' : '',
    featured ? 'weeklyAdventureCard--featured' : '',
    !isBlocked ? 'weeklyAdventureCard--link' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (locked || softLocked) {
    return (
      <div className={cardClass} aria-disabled="true" {...cardSurfaceAttrs}>
        {content}
      </div>
    );
  }

  if (onActivate) {
    const handleActivateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ignoreNextClickRef.current) {
        ignoreNextClickRef.current = false;
        return;
      }
      event.stopPropagation();
      onActivate();
    };

    const handleActivatePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
      ignoreNextClickRef.current = true;
      event.preventDefault();
      event.stopPropagation();
      onActivate();
    };

    return (
      <button
        type="button"
        className={cardClass}
        onClick={handleActivateClick}
        onPointerUp={handleActivatePointerUp}
        {...cardSurfaceAttrs}
      >
        {content}
      </button>
    );
  }

  if (isExternal) {
    return (
      <a href={href} className={cardClass} {...cardSurfaceAttrs}>
        {content}
      </a>
    );
  }

  return (
    <Link to={href} state={linkState} className={cardClass} {...cardSurfaceAttrs}>
      {content}
    </Link>
  );
}
