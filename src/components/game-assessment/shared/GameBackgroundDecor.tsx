import React from 'react';

type GameBackgroundDecorProps = {
  variant?: 'default' | 'miranda' | 'caiden' | 'victoria' | 'victoria-focus-lab' | 'uncle-t' | 'charlie' | 'b4';
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
        <div className="game-deco game-deco--victoria-piece game-deco--victoria-piece-a" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M8 20 L32 8 L56 20 L48 52 L16 52 Z" stroke="currentColor" strokeWidth="2" />
            <path d="M32 8 L32 52" stroke="currentColor" strokeWidth="2" />
            <path d="M8 20 L56 20" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--victoria-piece game-deco--victoria-piece-b" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M6 14 L24 6 L42 14 L36 38 L12 38 Z" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--victoria-thought game-deco--victoria-thought-a" aria-hidden="true">
          <svg viewBox="0 0 80 64" fill="none">
            <ellipse cx="48" cy="28" rx="28" ry="20" stroke="currentColor" strokeWidth="2" />
            <circle cx="22" cy="50" r="6" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="58" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--victoria-thought game-deco--victoria-thought-b" aria-hidden="true">
          <svg viewBox="0 0 64 52" fill="none">
            <ellipse cx="36" cy="22" rx="22" ry="16" stroke="currentColor" strokeWidth="2" />
            <circle cx="16" cy="40" r="5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--victoria-star game-deco--victoria-star-a" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none">
            <path
              d="M20 4 L24 16 L36 16 L26 24 L30 36 L20 28 L10 36 L14 24 L4 16 L16 16 Z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="game-deco game-deco--victoria-star game-deco--victoria-star-b" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path
              d="M16 3 L19 13 L29 13 L21 19 L24 29 L16 23 L8 29 L11 19 L3 13 L13 13 Z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="game-deco game-deco--victoria-checklist game-deco--victoria-checklist-a" aria-hidden="true">
          <svg viewBox="0 0 48 60" fill="none">
            <rect x="6" y="4" width="36" height="52" rx="4" stroke="currentColor" strokeWidth="2" />
            <rect x="12" y="14" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            <path d="M14 18 L16 20 L20 16" stroke="currentColor" strokeWidth="2" />
            <line x1="24" y1="18" x2="36" y2="18" stroke="currentColor" strokeWidth="2" />
            <rect x="12" y="28" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            <line x1="24" y1="32" x2="34" y2="32" stroke="currentColor" strokeWidth="2" />
            <rect x="12" y="42" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            <line x1="24" y1="46" x2="32" y2="46" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--victoria-speech game-deco--victoria-speech-a" aria-hidden="true">
          <svg viewBox="0 0 88 64" fill="none">
            <rect x="8" y="8" width="72" height="40" rx="12" stroke="currentColor" strokeWidth="2" />
            <path d="M24 48 L32 58 L36 48" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </>
    );
  }

  if (variant === 'victoria-focus-lab') {
    return (
      <>
        <div className="game-deco game-deco--focusLab game-deco--focusLab-checklist-a" aria-hidden="true">
          <svg viewBox="0 0 48 60" fill="none">
            <rect x="6" y="4" width="36" height="52" rx="4" stroke="currentColor" strokeWidth="2" />
            <rect x="12" y="14" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            <line x1="24" y1="18" x2="36" y2="18" stroke="currentColor" strokeWidth="2" />
            <rect x="12" y="28" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            <line x1="24" y1="32" x2="34" y2="32" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--focusLab game-deco--focusLab-timer-a" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="26" r="16" stroke="currentColor" strokeWidth="2" />
            <path d="M24 26 L24 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 8 L30 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="game-deco game-deco--focusLab game-deco--focusLab-folder-a" aria-hidden="true">
          <svg viewBox="0 0 56 44" fill="none">
            <path d="M6 12 L18 6 L34 6 L42 12 Z" stroke="currentColor" strokeWidth="2" />
            <rect x="6" y="12" width="44" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--focusLab game-deco--focusLab-desk-a" aria-hidden="true">
          <svg viewBox="0 0 80 48" fill="none">
            <rect x="8" y="20" width="64" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
            <rect x="20" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="28" x2="12" y2="40" stroke="currentColor" strokeWidth="2" />
            <line x1="68" y1="28" x2="68" y2="40" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--focusLab game-deco--focusLab-sticky-a" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none">
            <rect x="6" y="6" width="28" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <line x1="12" y1="24" x2="24" y2="24" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          </svg>
        </div>
        <div className="game-deco game-deco--focusLab game-deco--focusLab-heart-a" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path
              d="M16 26 C10 20 4 16 4 11 C4 7 7 4 11 4 C13.5 4 15.5 5.5 16 7.5 C16.5 5.5 18.5 4 21 4 C25 4 28 7 28 11 C28 16 22 20 16 26 Z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="game-deco game-deco--focusLab game-deco--focusLab-bulb-a" aria-hidden="true">
          <svg viewBox="0 0 40 48" fill="none">
            <circle cx="20" cy="18" r="12" stroke="currentColor" strokeWidth="2" />
            <path d="M14 34 L26 34 L24 42 L16 42 Z" stroke="currentColor" strokeWidth="2" />
            <path d="M20 6 L20 2" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </>
    );
  }

  if (variant === 'uncle-t') {
    return (
      <>
        <div className="game-deco game-deco--uncle-t-clipboard" aria-hidden="true">
          <svg viewBox="0 0 48 60" fill="none">
            <rect x="8" y="6" width="32" height="48" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M14 18 L34 18 M14 28 L30 28 M14 38 L26 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="game-deco game-deco--uncle-t-whistle" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none">
            <path
              d="M8 14 C14 8 24 10 28 18 C32 26 24 32 18 28"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="30" cy="18" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--uncle-t-flame" aria-hidden="true">
          <img src="/images/icons/focus-flame-mark.svg" alt="" />
        </div>
      </>
    );
  }

  if (variant === 'charlie') {
    return (
      <>
        <div className="game-deco game-deco--charlie-leaf-a" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M32 8 C18 20 12 36 20 52 C28 44 40 36 48 20 C42 12 36 8 32 8 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="game-deco game-deco--charlie-leaf-b" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M24 6 C14 16 10 28 16 40 C22 34 30 26 34 14 C30 8 26 6 24 6 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="game-deco game-deco--charlie-shell-a" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <ellipse cx="24" cy="28" rx="16" ry="12" stroke="currentColor" strokeWidth="2" />
            <path d="M16 24 C20 18 28 18 32 24" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="game-deco game-deco--charlie-rain-a" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M10 20 C16 12 28 12 34 20 C38 24 38 32 32 34 H14 C10 32 8 26 10 20 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="game-deco game-deco--charlie-vine-a" aria-hidden="true">
          <svg viewBox="0 0 80 48" fill="none">
            <path d="M8 40 C20 20 40 16 56 8 C64 4 72 8 72 8" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
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
