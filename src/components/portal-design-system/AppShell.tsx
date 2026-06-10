import React from 'react';
import PortalShell from '../portal/PortalShell';

export type AppShellVariant = 'facilitator' | 'family' | 'kid';

type AppShellProps = {
  variant: AppShellVariant;
  sidebar: React.ReactNode;
  topBar: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Shared portal shell for Facilitator, Family, and Kid portals.
 * B-4 assistant mounts globally via App.tsx (DeferredB4ChatWidget).
 */
export default function AppShell({ variant, sidebar, topBar, footer, children }: AppShellProps) {
  const shellVariant = variant === 'kid' ? 'family' : variant;

  return (
    <PortalShell variant={shellVariant} sidebar={sidebar} topBar={topBar} footer={footer}>
      {children}
    </PortalShell>
  );
}
