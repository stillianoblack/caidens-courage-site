import React from 'react';
import type { FamilySidebarNavId } from '../../data/familyPortalContent';

type FamilyNavIconProps = {
  name: FamilySidebarNavId;
};

export default function FamilyNavIcon({ name }: FamilyNavIconProps) {
  const common = {
    className: 'family-railIconSvg',
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true as const,
  };

  switch (name) {
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
    case 'continue-learning':
      return (
        <svg {...common}>
          <path
            d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 18.2l.9-5.5-4-3.9 5.5-.8L12 3z"
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
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.75" />
          <path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
