import React from 'react';
import type { PilotSidebarNavId } from '../../data/pilotDashboardContent';

type PilotNavIconProps = {
  name: PilotSidebarNavId;
};

export default function PilotNavIcon({ name }: PilotNavIconProps) {
  const common = { className: 'pilot-railIconSvg', viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true as const };

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
    case 'roster':
      return (
        <svg {...common}>
          <path d="M8 11a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.75" />
          <path d="M4 19c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M16 8h5M18.5 5.5v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 'weekly-modules':
      return (
        <svg {...common}>
          <path d="M5 6h14M5 12h14M5 18h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="8" cy="6" r="1.5" fill="currentColor" />
          <circle cx="8" cy="12" r="1.5" fill="currentColor" />
          <circle cx="8" cy="18" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'activities-library':
      return (
        <svg {...common}>
          <path d="M7 5h10a2 2 0 012 2v12a1 1 0 01-1.4.9L12 18.2l-5.6 1.7A1 1 0 015 19V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 'assessments':
      return (
        <svg {...common}>
          <path d="M9 5H7a2 2 0 00-2 2v12h14V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.75" />
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.75" />
          <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 'results':
      return (
        <svg {...common}>
          <path d="M5 19V9M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case 'certificates':
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="1.75" />
          <path d="M8.5 13L7 21l5-2.5L17 21l-1.5-8" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case 'student-gallery':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M8 14l2.5-2.5L13 14l2-2 3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="10" r="1.25" fill="currentColor" />
        </svg>
      );
    case 'facilitator-center':
      return (
        <svg {...common}>
          <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.75" />
          <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
