import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { normalizeGradeLevelStorage, type GradeLevel } from '../data/gradeLevelOptions';
import { getGradeBand } from './getGradeBand';
import {
  isValidSupabaseParticipantId,
  resolveExistingStudentParticipant,
} from './pilotTrackingService';
import { saveParticipantGradeLevel } from './participantGradeService';
import {
  backfillStudentFamilyLinkParentContact,
  createCampStudentFamilyLink,
  ensureCampStudentFamilyLink,
} from './studentFamilyLinkService';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type AdminEmergencyAddStudentInput = {
  childFirstName: string;
  childNickname?: string;
  gradeLevel: GradeLevel;
  parentEmail?: string;
  campProgramCode: string;
  groupName?: string;
  notes?: string;
};

export type AdminEmergencyAddStudentResult = {
  success: boolean;
  participantId?: string;
  displayName: string;
  familyAccessCode?: string | null;
  facilitatorAccessCode?: string | null;
  message: string;
};

function childDisplayName(firstName: string, nickname?: string): string {
  return nickname?.trim() || firstName.trim();
}

async function fetchPilotProgramAccessCodes(
  campProgramCode: string,
): Promise<{ familyAccessCode: string | null; facilitatorAccessCode: string | null; programName: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { familyAccessCode: null, facilitatorAccessCode: null, programName: null };
  }

  const { data, error } = await withTimeout(
    supabase
      .from('pilot_programs')
      .select('program_name, family_access_code, facilitator_access_code')
      .eq('program_code', campProgramCode.trim())
      .limit(1)
      .maybeSingle(),
    DASHBOARD_FETCH_TIMEOUT_MS,
    'admin_emergency_program_lookup',
  );

  if (error || !data) {
    return { familyAccessCode: null, facilitatorAccessCode: null, programName: null };
  }

  return {
    familyAccessCode: (data.family_access_code as string | null) ?? null,
    facilitatorAccessCode: (data.facilitator_access_code as string | null) ?? null,
    programName: (data.program_name as string | null) ?? null,
  };
}

export async function createAdminEmergencyStudent(
  input: AdminEmergencyAddStudentInput,
): Promise<AdminEmergencyAddStudentResult> {
  const childFirstName = input.childFirstName.trim();
  const campProgramCode = input.campProgramCode.trim();
  const gradeLevel = normalizeGradeLevelStorage(input.gradeLevel);
  const displayName = childDisplayName(childFirstName, input.childNickname);
  const groupName = input.groupName?.trim() || null;
  const notes = input.notes?.trim() || null;
  const parentEmail = input.parentEmail?.trim() || '';

  if (!childFirstName) {
    return { success: false, displayName, message: 'Child first name is required.' };
  }
  if (!campProgramCode) {
    return { success: false, displayName, message: 'Program/camp code is required.' };
  }
  if (!gradeLevel) {
    return { success: false, displayName, message: 'Grade level is required.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, displayName, message: 'Supabase is not configured. Cannot add student.' };
  }

  const programAccess = await fetchPilotProgramAccessCodes(campProgramCode);
  const gradeBand = getGradeBand(gradeLevel);

  try {
    const existing = await resolveExistingStudentParticipant({
      programCode: campProgramCode,
      nickname: displayName,
      firstName: childFirstName,
      groupName,
      parentEmail,
      diagnosticTag: 'admin_emergency_add_student',
    });

    if (existing) {
      await saveParticipantGradeLevel(existing.participantId, gradeLevel);

      if (parentEmail) {
        const linkResult = await ensureCampStudentFamilyLink({
          studentId: existing.participantId,
          campProgramCode,
        });

        if (!linkResult.success) {
          return {
            success: true,
            participantId: existing.participantId,
            displayName,
            familyAccessCode: programAccess.familyAccessCode,
            facilitatorAccessCode: programAccess.facilitatorAccessCode,
            message: `${displayName} already existed in ${programAccess.programName ?? campProgramCode}, but the parent link failed: ${linkResult.error ?? 'unknown error'}.`,
          };
        }

        if (linkResult.link?.id) {
          await backfillStudentFamilyLinkParentContact({
            linkId: linkResult.link.id,
            parentEmail,
            parentFirstName: 'Parent',
            parentLastName: 'Pending',
          });
        }
      }

      return {
        success: true,
        participantId: existing.participantId,
        displayName,
        familyAccessCode: programAccess.familyAccessCode,
        facilitatorAccessCode: programAccess.facilitatorAccessCode,
        message: `${displayName} already exists in ${programAccess.programName ?? campProgramCode}; reused the existing student instead of creating a duplicate.`,
      };
    }

    const insertPayload: Record<string, string | null> = {
      role: 'student',
      nickname: displayName,
      first_name: childFirstName,
      program_code: campProgramCode,
      group_name: groupName,
      grade_level: gradeLevel,
      grade_band: gradeBand,
    };

    const { data, error: insertError } = await withTimeout(
      supabase.from('participants').insert(insertPayload).select('id').single(),
      DASHBOARD_FETCH_TIMEOUT_MS,
      'admin_emergency_student_insert',
    );

    if (insertError) {
      return { success: false, displayName, message: insertError.message };
    }

    const participantId = data?.id as string | undefined;
    if (!isValidSupabaseParticipantId(participantId)) {
      return { success: false, displayName, message: 'Participant insert did not return a valid UUID.' };
    }
    const savedParticipantId = participantId as string;

    await saveParticipantGradeLevel(savedParticipantId, gradeLevel);

    if (parentEmail) {
      const linkResult = await createCampStudentFamilyLink({
        studentId: savedParticipantId,
        campProgramCode,
        parentFirstName: 'Parent',
        parentLastName: 'Pending',
        parentEmail,
        relationship: notes ? `admin (${notes.slice(0, 120)})` : 'parent',
      });

      if (!linkResult.success) {
        return {
          success: true,
          participantId: savedParticipantId,
          displayName,
          familyAccessCode: programAccess.familyAccessCode,
          facilitatorAccessCode: programAccess.facilitatorAccessCode,
          message: `${displayName} was added to ${programAccess.programName ?? campProgramCode}, but the parent link failed: ${linkResult.error ?? 'unknown error'}. Share the family access code so the parent can claim later.`,
        };
      }
    }

    const accessHint = programAccess.familyAccessCode
      ? ` Family access code: ${programAccess.familyAccessCode}.`
      : '';

    return {
      success: true,
      participantId: savedParticipantId,
      displayName,
      familyAccessCode: programAccess.familyAccessCode,
      facilitatorAccessCode: programAccess.facilitatorAccessCode,
      message: parentEmail
        ? `${displayName} was added to ${programAccess.programName ?? campProgramCode} and linked to ${parentEmail}.${accessHint}`
        : `${displayName} was added to ${programAccess.programName ?? campProgramCode}. Parent can claim later with the family access code.${accessHint}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not add student.';
    return { success: false, displayName, message };
  }
}
