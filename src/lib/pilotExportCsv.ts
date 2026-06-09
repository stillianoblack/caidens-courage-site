import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import {
  formatAssessmentScore,
  formatModuleScore,
  resolveParticipantDisplayName,
  type ParticipantNameLookup,
} from './pilotResultsDisplay';
import {
  buildStudentDetailSnapshot,
  pilotStudentStatusLabel,
  resolveStudentStatus,
} from './pilotStudentProgress';
import type { StudentParticipantRecord } from './pilotTrackingService';
import type { StudentFamilyLink } from './studentFamilyLinkService';

function escapeCsv(value: string | number | null | undefined): string {
  const text = value == null ? '' : String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function rowsToCsv(headers: string[], rows: string[][]): string {
  return [headers.join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n');
}

export function downloadPilotCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportStudentProgressCsv(input: {
  participants: StudentParticipantRecord[];
  assessments: LocalAssessmentV2Record[];
  modules: LocalModuleResultRecord[];
  links: StudentFamilyLink[];
  programCode?: string;
  lookup: ParticipantNameLookup;
}): string {
  const linkByStudent = new Map(input.links.map((link) => [link.student_id, link]));
  const rows = input.participants.map((participant) => {
    const link = linkByStudent.get(participant.id);
    const snapshot = buildStudentDetailSnapshot({
      participant,
      link,
      assessments: input.assessments,
      modules: input.modules,
      programCode: input.programCode,
    });
    return [
      resolveParticipantDisplayName(participant.id, input.lookup),
      snapshot.nickname,
      pilotStudentStatusLabel(snapshot.status),
      snapshot.baselineScore,
      String(snapshot.modulesCompleted),
      snapshot.lastAssessmentAt ?? '',
      snapshot.lastModuleAt ?? '',
      snapshot.lastActivityAt ?? '',
      snapshot.certificateReady ? 'Yes' : 'No',
    ];
  });

  return rowsToCsv(
    [
      'childName',
      'nickname',
      'status',
      'baselineScore',
      'modulesCompleted',
      'lastAssessmentAt',
      'lastModuleAt',
      'lastActivityAt',
      'certificateReady',
    ],
    rows,
  );
}

export function exportAssessmentResultsCsv(input: {
  assessments: LocalAssessmentV2Record[];
  lookup: ParticipantNameLookup;
}): string {
  const rows = input.assessments.map((row) => [
    resolveParticipantDisplayName(row.participant_id, input.lookup),
    row.program_code,
    row.assessment_type,
    formatAssessmentScore(row),
    row.completed_at ?? '',
    resolveStudentStatus({
      participantId: row.participant_id,
      assessments: [row],
      modules: [],
    }),
  ]);

  return rowsToCsv(
    ['childName', 'programCode', 'assessmentType', 'score', 'completedAt', 'status'],
    rows.map((row) => row.map((value) => String(value))),
  );
}

export function exportModuleResultsCsv(input: {
  modules: LocalModuleResultRecord[];
  lookup: ParticipantNameLookup;
}): string {
  const rows = input.modules.map((row) => [
    resolveParticipantDisplayName(row.participant_id, input.lookup),
    row.program_code,
    row.module_title || row.module_id,
    formatModuleScore(row),
    row.completed_at ?? '',
    'Complete',
  ]);

  return rowsToCsv(
    ['childName', 'programCode', 'moduleTitle', 'score', 'completedAt', 'status'],
    rows,
  );
}

export function exportGuardianContactCsv(input: {
  participants: StudentParticipantRecord[];
  links: StudentFamilyLink[];
  lookup: ParticipantNameLookup;
  programCode?: string;
}): string {
  const linkByStudent = new Map(input.links.map((link) => [link.student_id, link]));
  const rows = input.participants.map((participant) => {
    const link = linkByStudent.get(participant.id);
    return [
      resolveParticipantDisplayName(participant.id, input.lookup),
      participant.nickname?.trim() ?? '',
      link?.parent_first_name?.trim() ?? '',
      link?.parent_last_name?.trim() ?? '',
      link?.parent_email?.trim() ?? '',
      link?.parent_phone?.trim() ?? '',
      link?.camp_program_code?.trim() ?? input.programCode ?? '',
      link?.family_program_code?.trim() ?? '',
    ];
  });

  return rowsToCsv(
    [
      'childName',
      'nickname',
      'parentGuardianFirstName',
      'parentGuardianLastName',
      'parentGuardianEmail',
      'parentGuardianPhone',
      'campProgramCode',
      'familyProgramCode',
    ],
    rows,
  );
}
