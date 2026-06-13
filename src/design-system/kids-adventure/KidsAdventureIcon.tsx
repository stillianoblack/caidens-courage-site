import React from 'react';

export type KidsAdventureIconName =
  | 'home'
  | 'adventures'
  | 'gamepad'
  | 'characters'
  | 'inventory'
  | 'profile'
  | 'settings'
  | 'coin'
  | 'flame'
  | 'badge'
  | 'gift'
  | 'lock'
  | 'check'
  | 'sound';

type KidsAdventureIconProps = {
  name: KidsAdventureIconName;
  className?: string;
  size?: number;
  /** Solid fill style for active nav icons */
  filled?: boolean;
};

export default function KidsAdventureIcon({
  name,
  className = '',
  size = 20,
  filled = false,
}: KidsAdventureIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    className,
    'aria-hidden': true as const,
  };

  switch (name) {
    case 'home':
      if (filled) {
        return (
          <svg {...common}>
            <path
              d="M4 10.5L12 4l8 6.5V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-8.5z"
              fill="currentColor"
            />
            <path d="M10 20.5V14h4v6.5H10z" fill="#152238" />
          </svg>
        );
      }
      return (
        <svg {...common}>
          <path
            d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 01-1.5 1.5H6.5A1.5 1.5 0 015 19v-8.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M10 20.5V14h4v6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'adventures':
      return (
        <svg {...common}>
          <path
            d="M12 2.5l2.2 4.5 5 .75-3.6 3.5.85 5L12 14.8 7.35 16.2l.85-5L4.8 7.75l5-.75L12 2.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            fill={filled ? 'currentColor' : 'none'}
          />
        </svg>
      );
    case 'gamepad':
      return (
        <svg {...common}>
          <path
            d="M8 14h2v2H8v-2zm6 0h2v2h-2v-2zM6 10h12a3 3 0 013 3v1a5 5 0 01-5 5H8a5 5 0 01-5-5v-1a3 3 0 013-3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            fill={filled ? 'currentColor' : 'none'}
          />
          {!filled ? (
            <>
              <path d="M9 13.5v3M7.5 15H10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <circle cx="15.5" cy="14.5" r="0.85" fill="currentColor" />
              <circle cx="17.5" cy="16" r="0.85" fill="currentColor" />
            </>
          ) : null}
        </svg>
      );
    case 'characters':
      if (filled) {
        return (
          <svg {...common}>
            <circle cx="12" cy="9" r="4" fill="currentColor" />
            <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7H5z" fill="currentColor" />
          </svg>
        );
      }
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="2" />
          <path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'inventory':
      if (filled) {
        return (
          <svg {...common}>
            <path d="M7 9h10l-1.1 11H8.1L7 9z" fill="currentColor" />
            <path
              d="M9 9V6.5a3 3 0 016 0V9"
              stroke="#152238"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        );
      }
      return (
        <svg {...common}>
          <path d="M7 9h10l-1.1 11H8.1L7 9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 9V6.5a3 3 0 016 0V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" fill={filled ? 'currentColor' : 'none'} />
          <path
            d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill={filled ? 'currentColor' : 'none'}
          />
        </svg>
      );
    case 'settings':
      if (filled) {
        return (
          <svg {...common}>
            <path
              fill="currentColor"
              d="M19.4 13.1a7.5 7.5 0 000-2.2l2-1.6a.75.75 0 00.18-.96l-2-3.46a.75.75 0 00-.9-.33l-2.38.96a7.42 7.42 0 00-1.9-1.1l-.36-2.54A.75.75 0 0013.9 2h-4a.75.75 0 00-.74.63l-.36 2.54a7.42 7.42 0 00-1.9 1.1l-2.38-.96a.75.75 0 00-.9.33l-2 3.46a.75.75 0 00.18.96l2 1.6a7.5 7.5 0 000 2.2l-2 1.6a.75.75 0 00-.18.96l2 3.46a.75.75 0 00.9.33l2.38-.96c.59.45 1.22.8 1.9 1.1l.36 2.54a.75.75 0 00.74.63h4a.75.75 0 00.74-.63l.36-2.54c.68-.3 1.31-.65 1.9-1.1l2.38.96a.75.75 0 00.9-.33l2-3.46a.75.75 0 00-.18-.96l-2-1.6zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"
            />
          </svg>
        );
      }
      return (
        <svg {...common}>
          <path
            d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M19.4 13.1a7.5 7.5 0 000-2.2l2-1.6a.75.75 0 00.18-.96l-2-3.46a.75.75 0 00-.9-.33l-2.38.96a7.42 7.42 0 00-1.9-1.1l-.36-2.54A.75.75 0 0013.9 2h-4a.75.75 0 00-.74.63l-.36 2.54a7.42 7.42 0 00-1.9 1.1l-2.38-.96a.75.75 0 00-.9.33l-2 3.46a.75.75 0 00.18.96l2 1.6a7.5 7.5 0 000 2.2l-2 1.6a.75.75 0 00-.18.96l2 3.46a.75.75 0 00.9.33l2.38-.96c.59.45 1.22.8 1.9 1.1l.36 2.54a.75.75 0 00.74.63h4a.75.75 0 00.74-.63l.36-2.54c.68-.3 1.31-.65 1.9-1.1l2.38.96a.75.75 0 00.9-.33l2-3.46a.75.75 0 00-.18-.96l-2-1.6z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'coin':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill={filled ? 'currentColor' : 'none'} />
          <path d="M12 8v8M9 10.5h5a2 2 0 010 3h-4" stroke={filled ? '#152238' : 'currentColor'} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'flame':
      if (filled) {
        return (
          <svg {...common}>
            <path
              d="M12 2.5c1.8 3 5 5 5 8.5a5 5 0 11-10 0c0-3.5 3.2-5.5 5-8.5z"
              fill="currentColor"
            />
          </svg>
        );
      }
      return (
        <svg {...common}>
          <path
            d="M12 3c1.5 2.5 4 4.2 4 7.5a4 4 0 11-8 0c0-3.3 2.5-5 4-7.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'badge':
      return (
        <svg {...common}>
          <circle cx="12" cy="10" r="4.5" stroke="currentColor" strokeWidth="2" fill={filled ? 'currentColor' : 'none'} />
          <path d="M8.5 14L7 21l5-2.5L17 21l-1.5-7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'gift':
      return (
        <svg {...common}>
          <rect x="4" y="10" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="2" fill={filled ? 'currentColor' : 'none'} />
          <path d="M12 10V20M4 14h16" stroke="currentColor" strokeWidth="2" />
          <path d="M12 10c-2-2.5-4-3.5-4-5a2 2 0 114 0M12 10c2-2.5 4-3.5 4-5a2 2 0 10-4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="6" y="10" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill={filled ? 'currentColor' : 'none'} />
          <path d="M9 10V8a3 3 0 016 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill={filled ? 'currentColor' : 'none'} />
          <path d="M8 12.5l2.5 2.5L16 9.5" stroke={filled ? '#152238' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'sound':
      return (
        <svg {...common}>
          <path d="M11 6L7 10H4v4h3l4 4V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill={filled ? 'currentColor' : 'none'} />
          <path d="M16 9a4 4 0 010 6M18 7a7 7 0 010 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
