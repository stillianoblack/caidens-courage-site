import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import type { FamilyCharacterId } from '../../data/familyPortalContent';
import { CHARACTER_ASSETS } from '../../data/familyPortalContent';
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
  lockedLabel?: string;
  kind?: WeeklyAdventureCardKind;
  external?: boolean;
  linkState?: LinkProps['state'];
  className?: string;
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
  lockedLabel = 'Complete B-4 Check-In to unlock',
  kind = 'game',
  external,
  linkState,
  className,
}: WeeklyAdventureCardProps) {
  const themeClass = resolveThemeClass(character, kind);
  const isExternal = external ?? (href.startsWith('/downloads') || href.startsWith('http'));
  const displayCta = locked ? lockedLabel : cta;
  const footerPill = weekLabel ?? (!locked && status ? status : undefined);

  const content = (
    <>
      <div
        className="weeklyAdventureCardStrip"
        aria-hidden="true"
        style={accentColor ? { background: accentColor } : undefined}
      />
      <div className="weeklyAdventureCardMain">
        <CardAvatar character={character} kind={kind} avatarSrc={avatarSrc} />
        <div className="weeklyAdventureCardText">
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
            {!locked ? <span aria-hidden="true">→</span> : null}
          </span>
        </div>
      </div>
    </>
  );

  const cardClass = [
    'weeklyAdventureCard',
    themeClass,
    locked ? 'weeklyAdventureCard--locked' : 'weeklyAdventureCard--link',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (locked) {
    return (
      <div className={cardClass} aria-disabled="true">
        {content}
      </div>
    );
  }

  if (isExternal) {
    return (
      <a href={href} className={cardClass}>
        {content}
      </a>
    );
  }

  return (
    <Link to={href} state={linkState} className={cardClass}>
      {content}
    </Link>
  );
}
