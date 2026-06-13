import React from 'react';
import type { FamilySidebarNavId } from '../../data/familyPortalContent';
import type { FamilyMobileBottomNavId } from './FamilyMobileBottomNav';

export type FamilyNavIconName = FamilySidebarNavId | FamilyMobileBottomNavId;

type FamilyNavIconProps = {
  name: FamilyNavIconName;
  className?: string;
};

export default function FamilyNavIcon({ name, className }: FamilyNavIconProps) {
  const common = {
    className: className ?? 'family-railIconSvg',
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true as const,
  };

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path
            d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 01-1.5 1.5H6.5A1.5 1.5 0 015 19v-8.5z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M10 20.5V14h4v6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 'overview':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case 'results':
      return (
        <svg {...common}>
          <path d="M5 19V5M12 19V9M19 19V13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M4 5h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 'adventures':
    case 'continue-learning':
      return (
        <svg {...common}>
          <path
            d="M12 2.5l2.2 4.5 5 .75-3.6 3.5.85 5L12 14.8 7.35 16.2l.85-5L4.8 7.75l5-.75L12 2.5z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'downloads':
      return (
        <svg {...common}>
          <path d="M12 4v10M8.5 10.5L12 14l3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 18h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 'gallery':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M8 14l2.5-2.5L13 14l2-2 3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="10" r="1.25" fill="currentColor" />
        </svg>
      );
    case 'certificates':
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="1.75" />
          <path d="M8.5 13L7 21l5-2.5L17 21l-1.5-8" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 'guide':
      return (
        <svg {...common}>
          <path d="M7 5h10a2 2 0 012 2v12a1 1 0 01-1.4.9L12 18.2l-5.6 1.7A1 1 0 015 19V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 'character-hub':
    case 'characters':
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.75" />
          <path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 'inventory':
      return (
        <svg {...common}>
          <path
            d="M7 9h10l-1.1 11H8.1L7 9z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M9 9V6.5a3 3 0 016 0V9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M9.5 13h5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
          <path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="17.5" cy="7.5" r="1.5" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}
