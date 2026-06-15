import React from 'react';
import PortalLayout from './PortalLayout';
import './portal-shell.css';
import './portal-layout.css';

type PortalShellProps = {
  variant: 'family' | 'facilitator';
  sidebar: React.ReactNode;
  topBar: React.ReactNode;
  footer?: React.ReactNode;
  floating?: React.ReactNode;
  rightRail?: React.ReactNode;
  shellClassName?: string;
  children: React.ReactNode;
};

export default function PortalShell({
  variant,
  sidebar,
  topBar,
  footer,
  floating,
  rightRail,
  shellClassName,
  children,
}: PortalShellProps) {
  const shellClass = [
    variant === 'family' ? 'family-shell portal-shell' : 'pilot-shell portal-shell',
    shellClassName,
  ]
    .filter(Boolean)
    .join(' ');
  const mainClass = variant === 'family' ? 'family-main' : 'pilot-main';
  const contentClass = variant === 'family' ? 'family-content portal-contentFrame' : 'pilot-content portal-contentFrame';

  return (
    <div className={shellClass}>
      {sidebar}
      <div className={mainClass}>
        {topBar}
        <PortalLayout rightRail={rightRail}>
          <div className={contentClass}>{children}</div>
        </PortalLayout>
        {footer}
      </div>
      {floating}
    </div>
  );
}
