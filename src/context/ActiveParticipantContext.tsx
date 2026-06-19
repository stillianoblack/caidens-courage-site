import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ACTIVE_CHILD_EVENT } from '../lib/activeChildContext';
import {
  autoSelectSingleChildRoster,
  rosterEntryFromChild,
  syncActiveParticipantStorage,
  validateStoredParticipantAgainstRoster,
} from '../lib/activeParticipantResolver';
import { loadFamilyChildrenRoster } from '../lib/familyChildrenRosterService';
import { setGameplayPlayerIdentity } from '../lib/gameplayPlayerIdentity';
import type {
  ActiveParticipantRosterEntry,
  ActiveParticipantState,
} from '../types/activeParticipant';
import { CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import { MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';

export type ActiveParticipantContextValue = {
  roster: ActiveParticipantRosterEntry[];
  participant: ActiveParticipantState | null;
  participantId: string;
  displayName: string;
  playerLabel: string;
  hasActiveParticipant: boolean;
  needsSelection: boolean;
  claimRequired: boolean;
  loading: boolean;
  selectParticipant: (entry: ActiveParticipantRosterEntry) => void;
  refreshRoster: () => Promise<void>;
  refreshParticipant: () => void;
};

const ActiveParticipantContext = createContext<ActiveParticipantContextValue | null>(null);

export function ActiveParticipantProvider({
  programCode,
  children,
}: {
  programCode: string;
  children: ReactNode;
}) {
  const [roster, setRoster] = useState<ActiveParticipantRosterEntry[]>([]);
  const [participant, setParticipant] = useState<ActiveParticipantState | null>(null);
  const [claimRequired, setClaimRequired] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncGameplayIdentity = useCallback(
    (resolved: ActiveParticipantState | null, rosterEntries: ActiveParticipantRosterEntry[]) => {
      if (!resolved?.participantId) {
        setGameplayPlayerIdentity(null);
        setParticipant(null);
        return;
      }

      const gradeLabel = rosterEntries.find((row) => row.participantId === resolved.participantId)?.gradeLabel;
      const playerLabel = gradeLabel
        ? `${resolved.displayName} · ${gradeLabel}`
        : resolved.displayName;

      setGameplayPlayerIdentity({
        participantId: resolved.participantId,
        displayName: resolved.displayName,
        playerLabel,
      });
      setParticipant(resolved);
    },
    [],
  );

  const refreshParticipant = useCallback(() => {
    const validated = validateStoredParticipantAgainstRoster(roster);
    syncGameplayIdentity(validated, roster);
  }, [roster, syncGameplayIdentity]);

  const refreshRoster = useCallback(async () => {
    if (!programCode.trim()) {
      setRoster([]);
      setGameplayPlayerIdentity(null);
      setParticipant(null);
      setClaimRequired(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const payload = await loadFamilyChildrenRoster(programCode);
      setRoster(payload.roster);
      setClaimRequired(payload.claimRequired);

      let resolved = validateStoredParticipantAgainstRoster(payload.roster);
      if (!resolved) {
        resolved = autoSelectSingleChildRoster(payload.roster);
      }
      syncGameplayIdentity(resolved, payload.roster);
    } finally {
      setLoading(false);
    }
  }, [programCode, syncGameplayIdentity]);

  useEffect(() => {
    void refreshRoster();
  }, [refreshRoster]);

  useEffect(() => {
    const handleRosterRefresh = () => {
      void refreshRoster();
    };

    window.addEventListener(ACTIVE_CHILD_EVENT, handleRosterRefresh);
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRosterRefresh);
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRosterRefresh);

    return () => {
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleRosterRefresh);
      window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRosterRefresh);
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRosterRefresh);
    };
  }, [refreshRoster]);

  const selectParticipant = useCallback((entry: ActiveParticipantRosterEntry) => {
    const next = syncActiveParticipantStorage(
      rosterEntryFromChild({
        participantId: entry.participantId,
        displayName: entry.displayName,
        firstName: entry.firstName,
        gradeLevel: entry.gradeLevel,
      }),
    );
    setParticipant({
      participantId: next.participantId,
      displayName: next.displayName,
      firstName: next.firstName,
    });
    const gradeLabel = roster.find((row) => row.participantId === next.participantId)?.gradeLabel;
    const playerLabel = gradeLabel
      ? `${next.displayName} · ${gradeLabel}`
      : next.displayName;
    setGameplayPlayerIdentity({
      participantId: next.participantId,
      displayName: next.displayName,
      playerLabel,
    });
  }, [roster]);

  const playerLabel = useMemo(() => {
    if (!participant?.participantId) return 'Choose Player';
    const gradeLabel = roster.find((row) => row.participantId === participant.participantId)?.gradeLabel;
    if (gradeLabel) {
      return `${participant.displayName} · ${gradeLabel}`;
    }
    return participant.displayName;
  }, [participant, roster]);

  const value = useMemo<ActiveParticipantContextValue>(
    () => ({
      roster,
      participant,
      participantId: participant?.participantId ?? '',
      displayName: participant?.displayName ?? '',
      playerLabel,
      hasActiveParticipant: Boolean(participant?.participantId),
      needsSelection: roster.length > 1 && !participant?.participantId,
      claimRequired,
      loading,
      selectParticipant,
      refreshRoster,
      refreshParticipant,
    }),
    [
      roster,
      participant,
      playerLabel,
      claimRequired,
      loading,
      selectParticipant,
      refreshRoster,
      refreshParticipant,
    ],
  );

  return (
    <ActiveParticipantContext.Provider value={value}>{children}</ActiveParticipantContext.Provider>
  );
}

export function useActiveParticipantContext(): ActiveParticipantContextValue {
  const ctx = useContext(ActiveParticipantContext);
  if (!ctx) {
    throw new Error('useActiveParticipantContext must be used within ActiveParticipantProvider');
  }
  return ctx;
}

export function useOptionalActiveParticipantContext(): ActiveParticipantContextValue | null {
  return useContext(ActiveParticipantContext);
}

/** Single-child provider for facilitator-launched kid play shell sessions. */
export function KidPlaySessionParticipantProvider({
  participantId,
  displayName,
  children,
}: {
  participantId: string;
  displayName: string;
  children: ReactNode;
}) {
  const roster = useMemo<ActiveParticipantRosterEntry[]>(
    () => [
      {
        participantId,
        displayName,
        firstName: displayName,
        gradeLevel: null,
        gradeLabel: null,
      },
    ],
    [displayName, participantId],
  );

  const participant = useMemo<ActiveParticipantState>(
    () => ({
      participantId,
      displayName,
      firstName: displayName,
    }),
    [displayName, participantId],
  );

  useEffect(() => {
    syncActiveParticipantStorage(participant);
    setGameplayPlayerIdentity({
      participantId,
      displayName,
      playerLabel: displayName,
    });
  }, [displayName, participant, participantId]);

  const value = useMemo<ActiveParticipantContextValue>(
    () => ({
      roster,
      participant,
      participantId,
      displayName,
      playerLabel: displayName,
      hasActiveParticipant: true,
      needsSelection: false,
      claimRequired: false,
      loading: false,
      selectParticipant: () => undefined,
      refreshRoster: async () => undefined,
      refreshParticipant: () => undefined,
    }),
    [displayName, participant, participantId, roster],
  );

  return (
    <ActiveParticipantContext.Provider value={value}>{children}</ActiveParticipantContext.Provider>
  );
}
