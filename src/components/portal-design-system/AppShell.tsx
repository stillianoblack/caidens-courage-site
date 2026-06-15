import React from 'react';
import PortalShell from '../portal/PortalShell';
import B4Assistant from './B4Assistant';

export type AppShellVariant = 'facilitator' | 'family' | 'kid';

type AppShellProps = {
  variant: AppShellVariant;
  sidebar: React.ReactNode;
  topBar: React.ReactNode;
  footer?: React.ReactNode;
  rightRail?: React.ReactNode;
  shellClassName?: string;
  children: React.ReactNode;
};

/** Shared portal shell for Facilitator, Family, and Kid portals. */
export default function AppShell({
  variant,
  sidebar,
  topBar,
  footer,
  rightRail,
  shellClassName,
  children,
}: AppShellProps) {
  const shellVariant = variant === 'kid' ? 'family' : variant;

  return (
    <PortalShell
      variant={shellVariant}
      sidebar={sidebar}
      topBar={topBar}
      footer={footer}
      rightRail={rightRail}
      shellClassName={shellClassName}
      floating={<B4Assistant />}
    >
      {children}
    </PortalShell>
  );
}
