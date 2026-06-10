import React from 'react';
import './portal-shell.css';

type PortalShellProps = {
  variant: 'family' | 'facilitator';
  sidebar: React.ReactNode;
  topBar: React.ReactNode;
  footer?: React.ReactNode;
  floating?: React.ReactNode;
  children: React.ReactNode;
};

export default function PortalShell({
  variant,
  sidebar,
  topBar,
  footer,
  floating,
  children,
}: PortalShellProps) {
  const shellClass = variant === 'family' ? 'family-shell portal-shell' : 'pilot-shell portal-shell';
  const mainClass = variant === 'family' ? 'family-main' : 'pilot-main';
  const contentClass = variant === 'family' ? 'family-content portal-contentFrame' : 'pilot-content portal-contentFrame';

  return (
    <div className={shellClass}>
      {sidebar}
      <div className={mainClass}>
        {topBar}
        <div className={contentClass}>{children}</div>
        {footer}
      </div>
      {floating}
    </div>
  );
}
