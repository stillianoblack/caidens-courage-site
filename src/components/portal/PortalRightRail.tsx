import React from 'react';

export type PortalRightRailProps = {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
};

/** Utility column beside portal main content — coach, insights, notifications. */
export default function PortalRightRail({
  children,
  className = '',
  'aria-label': ariaLabel = 'Portal utilities',
}: PortalRightRailProps) {
  return (
    <aside
      className={['portal-rightRail', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      {children}
    </aside>
  );
}
