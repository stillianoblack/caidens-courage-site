import React from 'react';

type FocusCoinIconProps = {
  size?: number;
  className?: string;
};

/** Inline SVG coin for reliable PNG export (avoids emoji rendering issues). */
export default function FocusCoinIcon({ size = 20, className = '' }: FocusCoinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="10" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1" />
      <path
        d="M12 7.5v9M9.5 10h4a2 2 0 010 4h-3"
        stroke="#92400E"
        strokeWidth="1.75"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
