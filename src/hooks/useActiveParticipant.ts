import { useActiveParticipantContext, useOptionalActiveParticipantContext } from '../context/ActiveParticipantContext';
import type { ActiveParticipantRosterEntry } from '../types/activeParticipant';

/**
 * Resolve the active child participant for gameplay, assessments, and rewards.
 * Requires ActiveParticipantProvider on family portal layouts.
 */
export function useActiveParticipant() {
  const ctx = useOptionalActiveParticipantContext();
  if (!ctx) {
    return {
      roster: [] as ActiveParticipantRosterEntry[],
      participant: null,
      participantId: '',
      displayName: '',
      playerLabel: 'Choose Player',
      hasActiveParticipant: false,
      needsSelection: false,
      claimRequired: false,
      loading: false,
      selectParticipant: () => undefined,
      refreshRoster: async () => undefined,
      refreshParticipant: () => undefined,
    };
  }
  return ctx;
}

export function useActiveParticipantRequired() {
  return useActiveParticipantContext();
}
