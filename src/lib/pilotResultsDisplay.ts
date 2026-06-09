import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import type { StudentParticipantRecord } from './pilotTrackingService';

export type ParticipantNameLookup = Map<string, Pick<StudentParticipantRecord, 'nickname' | 'first_name'>>;

export function buildParticipantNameLookup(
  participants: StudentParticipantRecord[],
): ParticipantNameLookup {
  const lookup: ParticipantNameLookup = new Map();
  for (const participant of participants) {
    lookup.set(participant.id, {
      nickname: participant.nickname,
      first_name: participant.first_name,
    });
  }
  return lookup;
}

export function resolveParticipantDisplayName(
  participantId: string | null | undefined,
  lookup: ParticipantNameLookup,
): string {
  const id = participantId?.trim();
  if (!id) return 'Unknown child';
  const participant = lookup.get(id);
  return participant?.nickname?.trim() || participant?.first_name?.trim() || id.slice(0, 8);
}

export function formatAssessmentScore(row: LocalAssessmentV2Record): string {
  if (row.percent_score != null) return `${Math.round(row.percent_score)}%`;
  if (row.total_score != null && row.max_score) {
    return `${row.total_score}/${row.max_score}`;
  }
  const parts = [
    row.confidence_score != null ? `Feelings ${row.confidence_score}` : null,
    row.reading_score != null ? `Reading ${row.reading_score}` : null,
    row.focus_score != null ? `Focus ${row.focus_score}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
}

export function formatModuleScore(row: LocalModuleResultRecord): string {
  if (row.percent_score != null) return `${Math.round(row.percent_score)}%`;
  if (row.max_score > 0) return `${row.score}/${row.max_score}`;
  return String(row.score);
}

export function collectParticipantIdsFromResults(input: {
  moduleResults: LocalModuleResultRecord[];
  assessmentResults: LocalAssessmentV2Record[];
}): string[] {
  const ids = new Set<string>();
  for (const row of input.moduleResults) {
    if (row.participant_id?.trim()) ids.add(row.participant_id.trim());
  }
  for (const row of input.assessmentResults) {
    if (row.participant_id?.trim()) ids.add(row.participant_id.trim());
  }
  return Array.from(ids);
}
