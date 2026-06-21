import { useCallback, useMemo, useState } from 'react';
import { readActivePilotProgram } from '../config/activePilotProgram';
import {
  PORTAL_UPDATES,
  filterPortalUpdatesForAudience,
  groupPortalUpdatesBySection,
  type PortalUpdate,
  type PortalUpdateSection,
} from '../data/portalUpdates';
import {
  markPortalUpdatesRead,
  readPortalUpdatesReadState,
} from '../lib/portalUpdatesReadState';

export type PortalUpdatesPortal = 'family' | 'facilitator';

export function resolvePortalUpdatesScopeId(): string {
  return readActivePilotProgram()?.programCode?.trim() || 'default';
}

function loadReadIds(portal: PortalUpdatesPortal, scopeId: string): Set<string> {
  return new Set(readPortalUpdatesReadState(portal, scopeId).readIds);
}

export function usePortalUpdates(portal: PortalUpdatesPortal) {
  const scopeId = resolvePortalUpdatesScopeId();
  const [readIds, setReadIds] = useState(() => loadReadIds(portal, scopeId));

  const updates = useMemo(
    () => filterPortalUpdatesForAudience(PORTAL_UPDATES, portal),
    [portal],
  );

  const grouped = useMemo(
    () => groupPortalUpdatesBySection(updates),
    [updates],
  );

  const refreshReadIds = useCallback(() => {
    setReadIds(loadReadIds(portal, scopeId));
  }, [portal, scopeId]);

  const unreadCount = useMemo(
    () => updates.filter((update) => !readIds.has(update.id)).length,
    [updates, readIds],
  );

  const markAllVisibleRead = useCallback(() => {
    markPortalUpdatesRead(
      portal,
      scopeId,
      updates.map((update) => update.id),
    );
    refreshReadIds();
  }, [portal, scopeId, updates, refreshReadIds]);

  const markOneRead = useCallback(
    (updateId: string) => {
      markPortalUpdatesRead(portal, scopeId, [updateId]);
      refreshReadIds();
    },
    [portal, scopeId, refreshReadIds],
  );

  const isUnread = useCallback(
    (update: PortalUpdate) => !readIds.has(update.id),
    [readIds],
  );

  const sections = useMemo(() => {
    const order: PortalUpdateSection[] = ['new', 'this_week', 'previous'];
    return order
      .map((section) => ({ section, items: grouped[section] }))
      .filter((entry) => entry.items.length > 0);
  }, [grouped]);

  return {
    updates,
    grouped,
    sections,
    unreadCount,
    isUnread,
    markAllVisibleRead,
    markOneRead,
  };
}
