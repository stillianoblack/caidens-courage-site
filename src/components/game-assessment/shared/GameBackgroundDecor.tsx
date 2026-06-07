import React from 'react';

type GameBackgroundDecorProps = {
  variant?: 'default' | 'miranda' | 'caiden' | 'victoria';
};

export default function GameBackgroundDecor({ variant = 'default' }: GameBackgroundDecorProps) {
  if (variant === 'miranda') {
    return (
      <>
        <div className="game-deco game-deco--purple-tr" aria-hidden="true" />
        <div className="game-deco game-deco--purple-mid" aria-hidden="true" />
        <div className="game-deco game-deco--gold-br" aria-hidden="true" />
        <div className="game-deco game-deco--gold-tl" aria-hidden="true" />
        <div className="game-deco game-deco--dots-left" aria-hidden="true" />
        <div className="game-deco game-deco--map-dots" aria-hidden="true" />
        <div className="game-deco game-deco--clue-card game-deco--clue-card-a" aria-hidden="true" />
        <div className="game-deco game-deco--clue-card game-deco--clue-card-b" aria-hidden="true" />
        <div className="game-deco game-deco--notebook" aria-hidden="true" />
        <div className="game-deco game-deco--magnifier" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="28" cy="28" r="16" stroke="currentColor" strokeWidth="3" />
            <path d="M40 40 L54 54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="game-deco game-deco--flame-watermark game-deco--flame-a" aria-hidden="true">
          <img src="/images/icons/focus-flame-mark.svg" alt="" />
        </div>
        <div className="game-deco game-deco--flame-watermark game-deco--flame-b" aria-hidden="true">
          <img src="/images/icons/focus-flame-mark.svg" alt="" />
        </div>
      </>
    );
  }

  if (variant === 'victoria') {
    return (
      <>
        <div className="game-deco game-deco--victoria-glow game-deco--victoria-glow-a" aria-hidden="true" />
        <div className="game-deco game-deco--victoria-glow game-deco--victoria-glow-b" aria-hidden="true" />
        <div className="game-deco game-deco--victoria-dots" aria-hidden="true" />
      </>
    );
  }

  if (variant === 'caiden') {
    return (
      <>
        <div className="game-deco game-deco--caiden-glow game-deco--caiden-glow-a" aria-hidden="true" />
        <div className="game-deco game-deco--caiden-glow game-deco--caiden-glow-b" aria-hidden="true" />
        <div className="game-deco game-deco--caiden-lines" aria-hidden="true" />
        <div className="game-deco game-deco--caiden-dots" aria-hidden="true" />
        <div className="game-deco game-deco--caiden-timer" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
            <path d="M24 24 L24 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="game-deco game-deco--caiden-backpack" aria-hidden="true">
          <svg viewBox="0 0 48 56" fill="none" aria-hidden="true">
            <rect x="8" y="16" width="32" height="36" rx="6" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16 L24 6 L32 16" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--flame-watermark game-deco--flame-a" aria-hidden="true">
          <img src="/images/icons/focus-flame-mark.svg" alt="" />
        </div>
        <div className="game-deco game-deco--flame-watermark game-deco--flame-c" aria-hidden="true">
          <img src="/images/icons/focus-flame-mark.svg" alt="" />
        </div>
      </>
    );
  }

  return null;
}
