import React from 'react';
import PortalRightRail from './PortalRightRail';

export type PortalLayoutProps = {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
};

/**
 * Two-column portal workspace: main dashboard content + optional right utility rail.
 * Main content max-width is preserved; the rail sits outside the content frame.
 */
export default function PortalLayout({ children, rightRail }: PortalLayoutProps) {
  if (!rightRail) {
    return <>{children}</>;
  }

  return (
    <div className="portal-layout portal-layout--withRail">
      <div className="portal-layoutMain">{children}</div>
      <PortalRightRail>{rightRail}</PortalRightRail>
    </div>
  );
}
