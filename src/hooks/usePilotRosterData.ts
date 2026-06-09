import { useCallback, useEffect, useMemo, useState } from 'react';
import { isChildBaselineAssessmentType } from '../config/assessmentTypeConstants';
import { afterIdle } from '../lib/defer';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../lib/pilotTrackingLocalStorage';
import { resolveParticipantDisplayName, buildParticipantNameLookup } from '../lib/pilotResultsDisplay';
import {
  resolveParticipantLastActivity,
  resolveStudentStatus,
  type PilotStudentStatus,
} from '../lib/pilotStudentProgress';
import {
  fetchStudentParticipantsFromSupabase,
  loadPilotTrackingData,
  type StudentParticipantRecord,
} from '../lib/pilotTrackingService';
import {
  fetchStudentFamilyLinksByCampProgram,
  type StudentFamilyLink,
} from '../lib/studentFamilyLinkService';

export type PilotRosterRow = {
  participantId: string;
  childName: string;
  nickname: string;
  parentGuardianName: string;
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
};

function resolveBaselineStatus(
  participantId: string,
  assessments: LocalAssessmentV2Record[],
): PilotRosterRow['baselineStatus'] {
  const rows = assessments.filter(
    (row) =>
      row.participant_id === participantId && isChildBaselineAssessmentType(row.assessment_type),
  );
  if (rows.some((row) => Boolean(row.participant_id?.trim()))) return 'Complete';
  if (rows.length > 0) return 'In Progress';
  return 'Not Started';
}

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
      const [participantsPayload, linksPayload, trackingPayload] = await Promise.all([
        fetchStudentParticipantsFromSupabase(code),
        fetchStudentFamilyLinksByCampProgram(code),
        loadPilotTrackingData(code),
      ]);

      setParticipants(participantsPayload.participants);
      setLinks(linksPayload.links);
      setAssessmentResults(trackingPayload.assessmentResults);
      setModuleResults(trackingPayload.moduleResults);
      setWarning(
        participantsPayload.error || linksPayload.error || trackingPayload.warning || undefined,
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
        };
      })
      .sort((a, b) => a.childName.localeCompare(b.childName));
  }, [assessmentResults, links, moduleResults, participants, programCode, programFamilyAccessCode]);

  const participantLookup = useMemo(() => buildParticipantNameLookup(participants), [participants]);

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
    resolveName: (participantId: string) =>
      resolveParticipantDisplayName(participantId, participantLookup),
  };
}
