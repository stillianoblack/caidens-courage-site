import React from 'react';
import PilotDrawer from '../pilot-dashboard/PilotDrawer';

export type SlideOutDrawerSize = 'standard' | 'large';

type SlideOutDrawerProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  titleId?: string;
  size?: SlideOutDrawerSize;
};

/** Shared slide-out drawer shell — Facilitator + Family portals. */
export default function SlideOutDrawer({
  open,
  onClose,
  children,
  header,
  body,
  footer,
  className = 'pilot-drawer',
  titleId,
  size = 'standard',
}: SlideOutDrawerProps) {
  const sizeClass = size === 'large' ? ' ds-drawer--large' : '';
  const drawerClass = `${className}${sizeClass}`.trim();

  return (
    <PilotDrawer open={open} onClose={onClose} className={drawerClass} titleId={titleId}>
      {children ?? (
        <>
          {header}
          {body ? <div className="pilot-drawerBody">{body}</div> : null}
          {footer}
        </>
      )}
    </PilotDrawer>
  );
}
