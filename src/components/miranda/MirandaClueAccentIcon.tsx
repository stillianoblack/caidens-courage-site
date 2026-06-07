import React from 'react';
import type { MirandaClueAccent } from '../../types/gameAssessment';

type MirandaClueAccentIconProps = {
  accent: MirandaClueAccent;
  className?: string;
};

export default function MirandaClueAccentIcon({ accent, className = '' }: MirandaClueAccentIconProps) {
  const cls = ['miranda-clueAccent', `miranda-clueAccent--${accent}`, className].filter(Boolean).join(' ');

  switch (accent) {
    case 'note':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={cls} aria-hidden="true">
          <rect x="6" y="5" width="20" height="24" rx="2" fill="currentColor" fillOpacity="0.15" />
          <path d="M10 11h12M10 16h9M10 21h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'ember':
    case 'flame':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={cls} aria-hidden="true">
          <path
            d="M16 6c2 4 5 6 5 10a5 5 0 1 1-10 0c0-4 3-6 5-10Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          <path
            d="M16 14c1 1.5 2.5 2.5 2.5 4a2.5 2.5 0 1 1-5 0c0-1.5 1.5-2.5 2.5-4Z"
            fill="#fff"
            fillOpacity="0.55"
          />
        </svg>
      );
    case 'magnifier':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={cls} aria-hidden="true">
          <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="2.25" />
          <path d="M20 20 27 27" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" />
        </svg>
      );
    case 'timeline':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={cls} aria-hidden="true">
          <circle cx="8" cy="16" r="3" fill="currentColor" />
          <circle cx="16" cy="16" r="3" fill="currentColor" fillOpacity="0.65" />
          <circle cx="24" cy="16" r="3" fill="currentColor" fillOpacity="0.4" />
          <path d="M11 16h2M19 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'clue-stack':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={cls} aria-hidden="true">
          <rect x="7" y="12" width="16" height="12" rx="2" fill="currentColor" fillOpacity="0.2" />
          <rect x="9" y="9" width="16" height="12" rx="2" fill="currentColor" fillOpacity="0.35" />
          <rect x="11" y="6" width="16" height="12" rx="2" fill="currentColor" fillOpacity="0.55" />
        </svg>
      );
    case 'emotion':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={cls} aria-hidden="true">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="14" r="1.5" fill="currentColor" />
          <circle cx="20" cy="14" r="1.5" fill="currentColor" />
          <path d="M12 20c1.5 2 6.5 2 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={cls} aria-hidden="true">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M11 16.5 14.5 20 21 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'pin':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={cls} aria-hidden="true">
          <path d="M16 6v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="6" r="4" fill="currentColor" fillOpacity="0.85" />
          <path d="M12 24h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function EvidenceStamp() {
  return (
    <span className="miranda-evidenceStamp" aria-hidden="true">
      EVIDENCE
    </span>
  );
}
