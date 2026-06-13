import { useCallback } from 'react';
import { useActiveParticipant } from './useActiveParticipant';

export type SelectableChild = {
  participantId: string;
  displayName: string;
  firstName?: string;
};

/**
 * @deprecated Prefer useActiveParticipant from ActiveParticipantProvider.
 * Bridges legacy selectableChildren props to the shared active participant context.
 */
export function useActiveChild(selectableChildren: SelectableChild[] = []) {
  const {
    participant,
    participantId,
    displayName,
    hasActiveParticipant,
    needsSelection,
    selectParticipant,
    refreshParticipant,
    roster,
  } = useActiveParticipant();

  const selectChild = useCallback(
    (child: SelectableChild) => {
      const match =
        roster.find((row) => row.participantId === child.participantId) ??
        ({
          participantId: child.participantId,
          displayName: child.displayName,
          firstName: child.firstName,
          gradeLevel: null,
          gradeLabel: null,
        } as const);
      selectParticipant(match);
      refreshParticipant();
    },
    [refreshParticipant, roster, selectParticipant],
  );

  const activeChild = participant
    ? {
        participantId: participant.participantId,
        displayName: participant.displayName,
        firstName: participant.firstName,
      }
    : null;

  const resolvedNeedsSelection =
    selectableChildren.length > 1 ? needsSelection || !hasActiveParticipant : false;

  return {
    activeChild,
    participantId,
    displayName,
    hasActiveChild: hasActiveParticipant,
    needsChildSelection: resolvedNeedsSelection,
    selectChild,
    refresh: refreshParticipant,
  };
}
