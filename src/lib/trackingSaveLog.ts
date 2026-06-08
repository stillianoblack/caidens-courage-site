export const TRACKING_SAVE_WARNING =
  'Your results were completed, but we could not save them yet. Please try again.';

export type TrackingSaveLogInput = {
  table: string;
  operation: 'insert' | 'update' | 'select';
  participantId?: string | null;
  participantName?: string | null;
  role?: string | null;
  programCode?: string | null;
  assessmentType?: string | null;
  response?: unknown;
  error?: unknown;
};

export function logTrackingSave(input: TrackingSaveLogInput): void {
  console.info('[TRACKING_SAVE]', {
    table: input.table,
    operation: input.operation,
    participant_id: input.participantId ?? null,
    participant_name: input.participantName ?? null,
    role: input.role ?? null,
    program_code: input.programCode ?? null,
    assessment_type: input.assessmentType ?? null,
    response: input.response ?? null,
  });
}

export function logTrackingSaveError(input: TrackingSaveLogInput): void {
  console.error('[TRACKING_SAVE_FAILED]', {
    table: input.table,
    operation: input.operation,
    participant_id: input.participantId ?? null,
    participant_name: input.participantName ?? null,
    role: input.role ?? null,
    program_code: input.programCode ?? null,
    assessment_type: input.assessmentType ?? null,
    response: input.response ?? null,
    error: input.error ?? null,
  });
}
