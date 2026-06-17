import React from 'react';
import './courage-hub-bottom-hud-tray.css';

type CourageHubBottomHudTrayProps = {
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
};

/** Transparent positioning shell — only individual glass pills are visible. */
export default function CourageHubBottomHudTray({
  ariaLabel,
  children,
  className = '',
}: CourageHubBottomHudTrayProps) {
  return (
    <div
      className={['courageHubHudPillDock', className].filter(Boolean).join(' ')}
      role="region"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
