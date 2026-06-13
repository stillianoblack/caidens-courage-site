export type ActiveParticipantRosterEntry = {
  participantId: string;
  displayName: string;
  firstName?: string;
  gradeLevel?: string | null;
  gradeLabel?: string | null;
};

export type ActiveParticipantState = {
  participantId: string;
  displayName: string;
  firstName?: string;
  gradeLevel?: string | null;
};

export type ActiveParticipantResolution = {
  participant: ActiveParticipantState | null;
  needsSelection: boolean;
  roster: ActiveParticipantRosterEntry[];
  loading: boolean;
  claimRequired: boolean;
};
