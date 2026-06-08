import React from 'react';
import { Link } from 'react-router-dom';
import type { FamilyCharacterId } from '../../data/familyPortalContent';
import { CHARACTER_ASSETS } from '../../data/familyPortalContent';

export type CharacterAdventureCardProps = {
  characterId: FamilyCharacterId;
  title: string;
  description: string;
  cta: string;
  href: string;
  status?: string;
  statusTone?: 'available' | 'locked' | 'complete' | 'review';
  layout?: 'vertical' | 'horizontal';
  locked?: boolean;
  lockedLabel?: string;
  skillTags?: string;
};

function ZekePlaceholderIcon() {
  return (
    <svg className="family-charCardPlaceholder" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="28" y="6" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="28" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M32 32h8M36 28v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CharacterAvatar({ characterId }: { characterId: FamilyCharacterId }) {
  const asset = CHARACTER_ASSETS[characterId];

  if (asset.imageSrc) {
    return (
      <img
        src={asset.imageSrc}
        alt=""
        className="family-charCardAvatar"
        width={80}
        height={80}
        loading="lazy"
      />
    );
  }

  return (
    <div className="family-charCardAvatar family-charCardAvatar--placeholder" aria-hidden="true">
      <ZekePlaceholderIcon />
    </div>
  );
}

export default function CharacterAdventureCard({
  characterId,
  title,
  description,
  cta,
  href,
  status,
  layout = 'vertical',
  locked = false,
  lockedLabel = 'Complete B-4 Check-In to unlock',
  skillTags,
}: CharacterAdventureCardProps) {
  const themeClass = `family-charCard--${characterId}`;
  const layoutClass = layout === 'horizontal' ? 'family-charCard--horizontal' : 'family-charCard--vertical';
  const pillClass = characterId;

  const content = (
    <>
      <div className="family-charCardStrip" aria-hidden="true" />
      <div className="family-charCardBody">
        <CharacterAvatar characterId={characterId} />
        <div className="family-charCardText">
          <h3 className="family-charCardTitle">{title}</h3>
          <p className="family-charCardDesc">{description}</p>
          {skillTags ? <p className="family-charCardTags">{skillTags}</p> : null}
        </div>
      </div>
      <div className="family-charCardFoot">
        {status ? (
          <span className={`family-charPill family-charPill--${pillClass}`}>
            {locked ? lockedLabel : status}
          </span>
        ) : locked ? (
          <span className={`family-charPill family-charPill--${pillClass}`}>{lockedLabel}</span>
        ) : (
          <span />
        )}
        <span className="family-charCta">
          {locked ? lockedLabel : cta}
          <span className="family-charCtaArrow" aria-hidden="true">
            →
          </span>
        </span>
      </div>
    </>
  );

  return locked ? (
    <div
      className={['family-charCard', themeClass, layoutClass, 'family-charCard--locked'].join(' ')}
      aria-disabled="true"
    >
      {content}
    </div>
  ) : (
    <Link to={href} className={['family-charCard', themeClass, layoutClass].join(' ')}>
      {content}
    </Link>
  );
}
