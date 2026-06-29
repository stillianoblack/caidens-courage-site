import { useCallback, useEffect, useMemo, useState } from 'react';
import { afterIdle } from '../lib/defer';
import { normalizeGradeLevelStorage, type GradeLevel } from '../data/gradeLevelOptions';
import { getGradeBand } from '../lib/getGradeBand';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../lib/pilotTrackingLocalStorage';
import { resolveParticipantDisplayName, buildParticipantNameLookup } from '../lib/pilotResultsDisplay';
import {
  resolveStudentDisplayNameOrFallback,
  resolveParentGuardianDisplayName,
  isPlaceholderParentName,
} from '../lib/studentDisplayName';
import { resolveRosterParentConnectionStatus } from '../lib/parentGuardianIdentity';
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
import {
  fetchStudentAccessFieldsByIds,
  type ParentConnectionStatus,
  type StudentAccessFields,
} from '../lib/studentPinService';
import { buildFamilyClaimUrl } from '../lib/familyClaimCode';
import { buildPortalProgramDiagnostic } from '../lib/portalDiagnostics';

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
  /** participants.program_code — use for PIN + claim operations */
  programCode: string;
  familyAccessCode: string;
  familyProgramCode: string;
  baselineStatus: 'Complete' | 'In Progress' | 'Not Started';
  status: PilotStudentStatus;
  moduleCompletions: number;
  lastActivityAt: string | null;
  gradeLevel: string | null;
  gradeBand: string | null;
  parentConnectionStatus: ParentConnectionStatus;
  parentConnectionLabel: string;
  hasPin: boolean;
  pinLastRotatedAt: string | null;
  familyClaimCode: string | null;
  familyClaimUrl: string | null;
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
  const [accessByParticipant, setAccessByParticipant] = useState<Map<string, StudentAccessFields>>(
    new Map(),
  );
  const [warning, setWarning] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    const code = programCode?.trim();
    if (!code) {
      setParticipants([]);
      setLinks([]);
      setAssessmentResults([]);
      setModuleResults([]);
      setAccessByParticipant(new Map());
      return;
    }

    setLoading(true);
    try {
      console.info('[PROGRAM_DASHBOARD_HYDRATION]', {
        step: 'roster_lookup_start',
        program_code: code,
      });
      const [linksPayload, trackingPayload, directoryPayload] = await Promise.all([
        fetchStudentFamilyLinksByCampProgram(code),
        loadPilotTrackingData(code),
        loadProgramParticipantDirectory(code),
      ]);

      const accessMap = await fetchStudentAccessFieldsByIds(
        directoryPayload.participants.map((row) => row.id),
      );
      console.info('[PROGRAM_DASHBOARD_HYDRATION]', {
        step: 'roster_lookup_complete',
        program_code: code,
        participants: directoryPayload.participants.length,
        family_links: linksPayload.links.length,
        module_results: trackingPayload.moduleResults.length,
        assessment_results: trackingPayload.assessmentResults.length,
        warning: directoryPayload.errors[0] || linksPayload.error || trackingPayload.warning || null,
      });

      setParticipants(directoryPayload.participants);
      setLinks(linksPayload.links);
      setAssessmentResults(trackingPayload.assessmentResults);
      setModuleResults(trackingPayload.moduleResults);
      setAccessByParticipant(accessMap);
      setWarning(
        resolveSyncWarningMessage(
          directoryPayload.errors[0] || linksPayload.error || trackingPayload.warning || undefined,
        ) ?? undefined,
      );
      void buildPortalProgramDiagnostic({
        programCode: code,
        programName: code,
        familyAccessCode: programFamilyAccessCode ?? '',
      }).then((diagnostic) => {
        if (diagnostic) {
          console.info('[PORTAL_PROGRAM_DIAGNOSTIC]', diagnostic);
        }
      });
    } catch (err) {
      console.warn('[PROGRAM_DASHBOARD_HYDRATION]', {
        step: 'roster_lookup_failed',
        program_code: code,
        error: err instanceof Error ? err.message : String(err),
      });
      setParticipants([]);
      setLinks([]);
      setAssessmentResults([]);
      setModuleResults([]);
      setAccessByParticipant(new Map());
      setWarning('Could not load synced roster data. Try refreshing or reopen this program from the portal.');
    } finally {
      setLoading(false);
    }
  }, [programCode, programFamilyAccessCode]);

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
        const access = accessByParticipant.get(participant.id);
        const moduleCompletions = moduleResults.filter(
          (row) => row.participant_id === participant.id,
        ).length;

        const parentGuardianName = resolveParentGuardianDisplayName({
          parent_first_name: link?.parent_first_name,
          parent_last_name: link?.parent_last_name,
          parent_email: link?.parent_email,
        });
        const parentFirst = isPlaceholderParentName(link?.parent_first_name)
          ? ''
          : link?.parent_first_name?.trim() || '';
        const parentLast = isPlaceholderParentName(link?.parent_last_name)
          ? ''
          : link?.parent_last_name?.trim() || '';
        const familyAccessCode =
          link?.family_program_code?.trim() || programFamilyAccessCode?.trim() || '—';
        const parentEmail = link?.parent_email?.trim() || '—';
        const parentConnection = resolveRosterParentConnectionStatus(link);
        const parentConnectionStatus = parentConnection.status;
        const familyClaimCode = access?.family_claim_code ?? null;
        const participantProgramCode = participant.program_code?.trim() || code;

        return {
          participantId: participant.id,
          childName: resolveStudentDisplayNameOrFallback({
            display_name: participant.display_name,
            nickname: participant.nickname,
            first_name: participant.first_name,
            last_name: participant.last_name,
          }),
          nickname: participant.nickname?.trim() || '—',
          parentGuardianName,
          parentGuardianShort: formatParentGuardianShort(parentFirst, parentLast),
          parentFirstName: parentFirst || '—',
          parentLastName: parentLast || '—',
          parentEmail,
          parentPhone: link?.parent_phone?.trim() || '—',
          emergencyContact: '—',
          campProgramCode: link?.camp_program_code?.trim() || participantProgramCode,
          programCode: participantProgramCode,
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
          parentConnectionStatus,
          parentConnectionLabel: parentConnection.label,
          hasPin: Boolean(access?.hasPin),
          pinLastRotatedAt: access?.pinLastRotatedAt ?? null,
          familyClaimCode,
          familyClaimUrl: familyClaimCode ? buildFamilyClaimUrl(familyClaimCode) : null,
        };
      })
      .sort((a, b) => a.childName.localeCompare(b.childName));
  }, [
    accessByParticipant,
    assessmentResults,
    links,
    moduleResults,
    participants,
    programCode,
    programFamilyAccessCode,
  ]);

  const participantLookup = useMemo(() => buildParticipantNameLookup(participants), [participants]);

  const updateParticipantGrade = useCallback((participantId: string, gradeLevel: GradeLevel) => {
    const gradeBand = getGradeBand(gradeLevel);
    setParticipants((current) =>
      current.map((row) =>
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
    loading,
    warning,
    refresh,
    updateParticipantGrade,
    participantLookup,
    resolveDisplayName: (participantId: string) =>
      resolveParticipantDisplayName(participantId, participantLookup),
  };
}
