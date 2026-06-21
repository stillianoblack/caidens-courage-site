import { readActiveChildNickname } from '../config/activeChildNickname';
import { readGameplayPlayerDisplayName } from './gameplayPlayerIdentity';
import {
  clearActiveChild,
  readActiveChildState,
  setActiveChild,
  type ActiveChildState,
} from './activeChildContext';
import type {
  ActiveParticipantRosterEntry,
  ActiveParticipantState,
} from '../types/activeParticipant';
import { formatGradeLevelLabel, isGradeLevel } from '../data/gradeLevelOptions';

export function rosterEntryFromChild(child: {
  participantId: string;
  displayName: string;
  firstName?: string;
  gradeLevel?: string | null;
}): ActiveParticipantRosterEntry {
  const gradeLevel = child.gradeLevel?.trim() || null;
  const gradeLabel =
    gradeLevel && isGradeLevel(gradeLevel) ? formatGradeLevelLabel(gradeLevel) : null;
  return {
    participantId: child.participantId,
    displayName: child.displayName,
    firstName: child.firstName,
    gradeLevel,
    gradeLabel,
  };
}

export function isParticipantInRoster(
  participantId: string,
  roster: ActiveParticipantRosterEntry[],
): boolean {
  const id = participantId.trim();
  if (!id) return false;
  return roster.some((row) => row.participantId === id);
}

export function readStoredParticipantId(): string {
  return readActiveChildState()?.participantId.trim() ?? '';
}

export function readActiveParticipantDisplayName(): string {
  const fromCache = readGameplayPlayerDisplayName();
  if (fromCache) return fromCache;

  const participantId = readStoredParticipantId();
  if (!participantId) return '';
  const state = readActiveChildState();
  if (state?.participantId === participantId && state.displayName.trim()) {
    return state.displayName.trim();
  }
  return '';
}

export function readActiveParticipantLabel(roster: ActiveParticipantRosterEntry[]): string {
  const participantId = readStoredParticipantId();
  if (!participantId) return 'Choose Player';

  const rosterMatch = roster.find((row) => row.participantId === participantId);
  const displayName =
    rosterMatch?.displayName.trim() ||
    rosterMatch?.firstName?.trim() ||
    'Player';
  const gradeLabel = rosterMatch?.gradeLabel?.trim();
  if (gradeLabel) {
    return `${displayName} · ${gradeLabel}`;
  }
  return displayName;
}

export function resolveActiveParticipantFromRoster(
  roster: ActiveParticipantRosterEntry[],
): ActiveParticipantState | null {
  const storedId = readStoredParticipantId();
  if (!storedId) return null;

  const match = roster.find((row) => row.participantId === storedId);
  if (!match) {
    return null;
  }

  const displayName =
    match.displayName.trim() ||
    match.firstName?.trim() ||
    'Player';

  return {
    participantId: match.participantId,
    displayName,
    firstName: match.firstName,
    gradeLevel: match.gradeLevel ?? null,
  };
}

export function syncActiveParticipantStorage(
  participant: ActiveParticipantState,
): ActiveChildState {
  const next: ActiveChildState = {
    participantId: participant.participantId,
    displayName: participant.displayName,
    firstName: participant.firstName,
  };
  setActiveChild(next);
  return next;
}

export function validateStoredParticipantAgainstRoster(
  roster: ActiveParticipantRosterEntry[],
): ActiveParticipantState | null {
  const storedId = readStoredParticipantId();
  if (!storedId) {
    if (readActiveChildNickname()) {
      clearActiveChild();
    }
    return null;
  }

  if (!isParticipantInRoster(storedId, roster)) {
    // Roster may still be loading, or a child was just saved — keep the stored selection.
    if (roster.length === 0) {
      const state = readActiveChildState();
      if (state?.participantId === storedId) {
        return {
          participantId: state.participantId,
          displayName: state.displayName.trim() || 'Player',
          firstName: state.firstName,
          gradeLevel: null,
        };
      }
      return null;
    }

    console.warn('[ACTIVE_PARTICIPANT] clearing invalid stored participant', {
      stored_participant_id: storedId,
      roster_ids: roster.map((row) => row.participantId),
    });
    clearActiveChild();
    return null;
  }

  const resolved = resolveActiveParticipantFromRoster(roster);
  if (resolved) {
    const storedName = readActiveChildState()?.displayName?.trim() ?? '';
    if (storedName !== resolved.displayName) {
      syncActiveParticipantStorage(resolved);
    }
  }
  return resolved;
}

export function autoSelectSingleChildRoster(
  roster: ActiveParticipantRosterEntry[],
): ActiveParticipantState | null {
  if (roster.length !== 1) return null;
  const only = roster[0];
  const participant: ActiveParticipantState = {
    participantId: only.participantId,
    displayName: only.displayName,
    firstName: only.firstName,
    gradeLevel: only.gradeLevel ?? null,
  };
  syncActiveParticipantStorage(participant);
  return participant;
}
