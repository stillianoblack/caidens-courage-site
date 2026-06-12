import { useCallback, useEffect, useMemo, useState } from 'react';
import { afterIdle } from '../lib/defer';
import { normalizeGradeLevelStorage, type GradeLevel } from '../data/gradeLevelOptions';
import { getGradeBand } from '../lib/getGradeBand';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../lib/pilotTrackingLocalStorage';
import { resolveParticipantDisplayName, buildParticipantNameLookup } from '../lib/pilotResultsDisplay';
import {
  formatParentGuardianShort,
  resolveBaselineStatus,
  resolveParticipantLastActivity,
  resolveStudentStatus,
  type PilotStudentStatus,
} from '../lib/pilotStudentProgress';
import { loadProgramParticipantDirectory } from '../lib/pilotParticipantDirectory';
import { loadPilotTrackingData, type StudentParticipantRecord } from '../lib/pilotTrackingService';
import {
  fetchStudentFamilyLinksByCampProgram,
  type StudentFamilyLink,
} from '../lib/studentFamilyLinkService';
import { resolveSyncWarningMessage } from '../lib/syncWarningMessages';

export type PilotRosterRow = {
  participantId: string;
  childName: string;
  nickname: string;
  parentGuardianName: string;
  parentGuardianShort: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContact: string;
  campProgramCode: string;
  familyAccessCode: string;
  familyProgramCode: string;
  baselineStatus: 'Complete' | 'In Progress' | 'Not Started';
  status: PilotStudentStatus;
  moduleCompletions: number;
  lastActivityAt: string | null;
  gradeLevel: string | null;
  gradeBand: string | null;
};

export function usePilotRosterData(
  programCode?: string,
  enabled = true,
  programFamilyAccessCode?: string,
) {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<StudentParticipantRecord[]>([]);
  const [links, setLinks] = useState<StudentFamilyLink[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<LocalAssessmentV2Record[]>([]);
  const [moduleResults, setModuleResults] = useState<LocalModuleResultRecord[]>([]);
  const [warning, setWarning] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    const code = programCode?.trim();
    if (!code) {
      setParticipants([]);
      setLinks([]);
      setAssessmentResults([]);
      setModuleResults([]);
      return;
    }

    setLoading(true);
    try {
      const [linksPayload, trackingPayload] = await Promise.all([
        fetchStudentFamilyLinksByCampProgram(code),
        loadPilotTrackingData(code),
      ]);

      const directoryPayload = await loadProgramParticipantDirectory(code);

      setParticipants(directoryPayload.participants);
      setLinks(linksPayload.links);
      setAssessmentResults(trackingPayload.assessmentResults);
      setModuleResults(trackingPayload.moduleResults);
      setWarning(
        resolveSyncWarningMessage(
          directoryPayload.errors[0] || linksPayload.error || trackingPayload.warning || undefined,
        ) ?? undefined,
      );
    } finally {
      setLoading(false);
    }
  }, [programCode]);

  useEffect(() => {
    if (!enabled) return;
    afterIdle(() => {
      void refresh();
    });
  }, [enabled, refresh]);

  const rows = useMemo((): PilotRosterRow[] => {
    const code = programCode?.trim() ?? '';
    const linkByStudent = new Map(links.map((link) => [link.student_id, link]));

    return participants
      .map((participant) => {
        const link = linkByStudent.get(participant.id);
        const moduleCompletions = moduleResults.filter(
          (row) => row.participant_id === participant.id,
        ).length;

        const parentFirst = link?.parent_first_name?.trim() || '';
        const parentLast = link?.parent_last_name?.trim() || '';
        const parentGuardianName = [parentFirst, parentLast].filter(Boolean).join(' ') || '—';
        const familyAccessCode =
          link?.family_program_code?.trim() || programFamilyAccessCode?.trim() || '—';

        return {
          participantId: participant.id,
          childName: participant.first_name?.trim() || participant.nickname?.trim() || 'Child',
          nickname: participant.nickname?.trim() || '—',
          parentGuardianName,
          parentGuardianShort: formatParentGuardianShort(parentFirst, parentLast),
          parentFirstName: parentFirst || '—',
          parentLastName: parentLast || '—',
          parentEmail: link?.parent_email?.trim() || '—',
          parentPhone: link?.parent_phone?.trim() || '—',
          emergencyContact: '—',
          campProgramCode: link?.camp_program_code?.trim() || code,
          familyAccessCode,
          familyProgramCode: link?.family_program_code?.trim() || '—',
          baselineStatus: resolveBaselineStatus(participant.id, assessmentResults),
          status: resolveStudentStatus({
            participantId: participant.id,
            assessments: assessmentResults,
            modules: moduleResults,
            participantCreatedAt: participant.created_at,
          }),
          moduleCompletions,
          lastActivityAt: resolveParticipantLastActivity(participant.id, {
            assessments: assessmentResults,
            modules: moduleResults,
            participantCreatedAt: participant.created_at,
          }),
          gradeLevel: normalizeGradeLevelStorage(participant.grade_level),
          gradeBand: participant.grade_band?.trim() || null,
        };
      })
      .sort((a, b) => a.childName.localeCompare(b.childName));
  }, [assessmentResults, links, moduleResults, participants, programCode, programFamilyAccessCode]);

  const participantLookup = useMemo(() => buildParticipantNameLookup(participants), [participants]);

  const updateParticipantGrade = useCallback((participantId: string, gradeLevel: GradeLevel) => {
    const gradeBand = getGradeBand(gradeLevel);
    setParticipants((prev) =>
      prev.map((row) =>
        row.id === participantId
          ? { ...row, grade_level: gradeLevel, grade_band: gradeBand }
          : row,
      ),
    );
  }, []);

  return {
    rows,
    participants,
    familyLinks: links,
    assessmentResults,
    moduleResults,
    participantLookup,
    loading: enabled && loading,
    warning,
    refresh,
    updateParticipantGrade,
    resolveName: (participantId: string) =>
      resolveParticipantDisplayName(participantId, participantLookup),
  };
}
