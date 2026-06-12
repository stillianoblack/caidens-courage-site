import React from 'react';

/** TODO: replace with final Zeke character art when available. */
export default function ZekePlaceholderAvatar({ className }: { className?: string }) {
  return (
    <div
      className={['weeklyAdventureCardAvatar weeklyAdventureCardAvatar--zekePlaceholder', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <svg className="weeklyAdventureCardZekeIcon" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M5.5 19.5c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
