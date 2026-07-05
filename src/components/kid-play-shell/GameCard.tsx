import React from 'react';

export type GameCardProps = {
  title: string;
  description: string;
  statusLabel: string;
  starsLabel?: string;
  bestScore?: number;
  ctaLabel: string;
  variant?: 'blue' | 'dragon' | 'memory' | 'focus' | 'empty';
  locked?: boolean;
  unlockText?: string;
  thumbnailSrc?: string;
  artLabel?: string;
  newTraining?: boolean;
  highlight?: boolean;
  onPlay?: () => void;
};

export default function GameCard({
  title,
  description,
  statusLabel,
  starsLabel,
  bestScore,
  ctaLabel,
  variant = 'blue',
  locked = false,
  unlockText,
  thumbnailSrc,
  artLabel,
  newTraining = false,
  highlight = false,
  onPlay,
}: GameCardProps) {
  return (
    <article
      className={[
        'kidArcadeGameCard',
        `kidArcadeGameCard--${variant}`,
        locked ? 'kidArcadeGameCard--locked' : '',
        highlight ? 'kidArcadeGameCard--highlight' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="kidArcadeGameCardArt" aria-hidden="true">
        {thumbnailSrc ? <img src={thumbnailSrc} alt="" loading="lazy" decoding="async" /> : null}
        {!thumbnailSrc && artLabel ? <span className="kidArcadeGameCardGlyph">{artLabel}</span> : null}
        {locked ? <span className="kidArcadeGameCardLock">Locked</span> : null}
      </div>
      <div className="kidArcadeGameCardCopy">
        <div className="kidArcadeGameCardMeta">
          {newTraining ? <span className="kidArcadeGameCardNewPill">New Training Sim</span> : null}
          <span>{statusLabel}</span>
          <span>{starsLabel ?? `${bestScore ?? 0} best`}</span>
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
        {locked && unlockText ? <p className="kidArcadeGameCardUnlock">{unlockText}</p> : null}
      </div>
      <button
        type="button"
        className="kidArcadeGameCardCta"
        onClick={onPlay}
        disabled={locked}
        aria-label={locked && unlockText ? `${title}. ${unlockText}` : `Play ${title}`}
      >
        {locked ? 'Locked' : ctaLabel}
      </button>
    </article>
  );
}
