import { dedupePortalFetch } from './portalFetchDedupe';
import { resolveTrackingProgramCode } from './activeProgramContext';
import { hydrateExistingFamilyChildren } from './hydrateExistingFamilyChildren';
import type { ActiveParticipantRosterEntry } from '../types/activeParticipant';
import { rosterEntryFromChild } from './activeParticipantResolver';

export type FamilyChildrenRoster = {
  programCode: string;
  roster: ActiveParticipantRosterEntry[];
  claimRequired: boolean;
  errors: string[];
};

async function loadFamilyChildrenRosterImpl(programCode: string): Promise<FamilyChildrenRoster> {
  if (!programCode.trim()) {
    return {
      programCode: '',
      roster: [],
      claimRequired: true,
      errors: ['Missing active program context.'],
    };
  }

  const hydration = await hydrateExistingFamilyChildren(programCode);
  const roster = hydration.children.map((child) =>
    rosterEntryFromChild({
      participantId: child.participantId,
      displayName: child.displayName,
      firstName: child.firstName ?? undefined,
      gradeLevel: child.gradeLevel,
    }),
  );

  return {
    programCode,
    roster,
    claimRequired: hydration.claimRequired,
    errors: hydration.errors,
  };
}

/** Lightweight roster fetch — children metadata only, no assessment/module bulk loads. */
export async function loadFamilyChildrenRoster(programCodeInput?: string): Promise<FamilyChildrenRoster> {
  const programCode = programCodeInput?.trim() || resolveTrackingProgramCode() || '';
  if (!programCode) {
    return loadFamilyChildrenRosterImpl('');
  }
  return dedupePortalFetch(`family-children-roster:${programCode}`, () =>
    loadFamilyChildrenRosterImpl(programCode),
  );
}
