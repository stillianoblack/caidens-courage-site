import React from 'react';
import type { BaselineModuleId } from '../../data/b4BaselineCheckContent';

type B4CheckInStepGraphicProps = {
  module: BaselineModuleId;
  questionIndex?: number;
  variant?: 'quiz' | 'complete';
};

export default function B4CheckInStepGraphic({
  module,
  questionIndex = 0,
  variant = 'quiz',
}: B4CheckInStepGraphicProps) {
  if (variant === 'complete') {
    return (
      <div className="b4-checkInGraphic b4-checkInGraphic--complete" aria-hidden="true">
        <svg viewBox="0 0 280 100" className="b4-checkInSvg">
          <circle cx="140" cy="50" r="36" fill="#fef3c7" stroke="#e5c06a" strokeWidth="3" />
          <path d="M128 50 L136 58 L154 40" fill="none" stroke="#243e70" strokeWidth="4" strokeLinecap="round" />
          <circle cx="220" cy="30" r="14" fill="#f97316" opacity="0.75" />
          <circle cx="60" cy="28" r="10" fill="#3b82f6" opacity="0.35" />
        </svg>
      </div>
    );
  }

  if (module === 'feelings') {
    return (
      <div className="b4-checkInGraphic b4-checkInGraphic--feelings" aria-hidden="true">
        <svg viewBox="0 0 280 100" className="b4-checkInSvg">
          <circle cx="70" cy="52" r="22" fill="#dbeafe" stroke="#243e70" strokeWidth="2" />
          <circle cx="58" cy="46" r="2" fill="#243e70" />
          <circle cx="82" cy="46" r="2" fill="#243e70" />
          <path d="M62 58 Q70 66 78 58" fill="none" stroke="#243e70" strokeWidth="2" />
          <circle cx="140" cy="48" r="18" fill="#fef3c7" stroke="#e5c06a" strokeWidth="2" />
          <circle cx="132" cy="44" r="2" fill="#92400e" />
          <circle cx="148" cy="44" r="2" fill="#92400e" />
          <path d="M132 54 Q140 62 148 54" fill="none" stroke="#92400e" strokeWidth="2" />
          <circle cx="210" cy="52" r="22" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="198" cy="46" r="2" fill="#243e70" />
          <circle cx="222" cy="46" r="2" fill="#243e70" />
          <path d="M202 62 Q210 54 218 62" fill="none" stroke="#243e70" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  if (module === 'reading' && questionIndex === 0) {
    return (
      <div className="b4-checkInGraphic b4-checkInGraphic--reading" aria-hidden="true">
        <svg viewBox="0 0 280 100" className="b4-checkInSvg">
          <rect x="80" y="24" width="120" height="56" rx="6" fill="#fff" stroke="#243e70" strokeWidth="2" />
          <line x1="96" y1="40" x2="184" y2="40" stroke="#243e70" strokeWidth="2" opacity="0.25" />
          <line x1="96" y1="52" x2="168" y2="52" stroke="#243e70" strokeWidth="2" opacity="0.25" />
          <line x1="96" y1="64" x2="176" y2="64" stroke="#243e70" strokeWidth="2" opacity="0.25" />
          <circle cx="220" cy="72" r="12" fill="#f97316" opacity="0.7" />
        </svg>
      </div>
    );
  }

  if (module === 'focus-moves') {
    return (
      <div className="b4-checkInGraphic b4-checkInGraphic--focus" aria-hidden="true">
        <svg viewBox="0 0 280 100" className="b4-checkInSvg">
          <path d="M120 70 L140 30 L160 70 Z" fill="#dbeafe" stroke="#243e70" strokeWidth="2" />
          <circle cx="140" cy="48" r="10" fill="#3b82f6" opacity="0.5" />
          <circle cx="210" cy="50" r="24" fill="none" stroke="#e5c06a" strokeWidth="3" strokeDasharray="4 4" />
          <circle cx="210" cy="50" r="8" fill="#f97316" opacity="0.85" />
          <path d="M60 70 L90 70" stroke="#243e70" strokeWidth="3" />
          <path d="M84 64 L90 70 L84 76" fill="none" stroke="#243e70" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  return null;
}
