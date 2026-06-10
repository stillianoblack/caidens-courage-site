import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { readActivePilotProgram } from '../config/activePilotProgram';
import {
  hasConfirmedParentClaim,
  readParentClaimContext,
  type ParentClaimContext,
} from '../config/parentClaimContext';
import { resolveTrackingProgramCode } from './activeProgramContext';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import {
  fetchParticipantsByIds,
  fetchStudentFamilyLinksByFamilyProgram,
  linkMatchesParentScope,
  type StudentFamilyLink,
} from './studentFamilyLinkService';

export type FamilyPortalLinkAuditResult = {
  programCode: string;
  familyUserId: string | null;
  participantId: string | null;
  parentClaim: ParentClaimContext | null;
  claimConfirmed: boolean;
  linkingMethod: 'parent_email' | 'parent_phone' | 'none';
  authUserId: string | null;
  studentsTableAvailable: boolean;
  participantsInScope: Array<{ id: string; nickname: string | null; first_name: string | null; program_code: string }>;
  allFamilyLinks: StudentFamilyLink[];
  scopedFamilyLinks: StudentFamilyLink[];
  unclaimedLinks: StudentFamilyLink[];
  emailMatchedUnclaimed: StudentFamilyLink[];
  findings: string[];
  shouldShowAddChild: boolean;
};

function maskEmail(email?: string | null): string | null {
  const value = email?.trim();
  if (!value) return null;
  const [local, domain] = value.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

async function probeStudentsTable(): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase.from('students').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export function resolveFamilyAddChildVisibility(input: {
  claimRequired: boolean;
  visibleChildrenCount: number;
  childrenSummaryCount: number;
  familyLinks: StudentFamilyLink[];
}): boolean {
  if (input.claimRequired) return false;
  if (input.visibleChildrenCount > 0 || input.childrenSummaryCount > 0) return false;
  const linkedStudentIds = input.familyLinks.filter((link) => link.student_id?.trim());
  if (linkedStudentIds.length > 0) return false;
  return true;
}

export async function auditFamilyPortalLinking(
  programCodeInput?: string,
): Promise<FamilyPortalLinkAuditResult> {
  const programCode =
    programCodeInput?.trim() || resolveTrackingProgramCode() || readActivePilotProgram()?.programCode || '';
  const parentClaim = readParentClaimContext();
  const claimConfirmed = hasConfirmedParentClaim(parentClaim);
  const participantId = readActiveChildParticipantId() || null;
  const findings: string[] = [];

  const linkingMethod: FamilyPortalLinkAuditResult['linkingMethod'] = parentClaim?.email
    ? 'parent_email'
    : parentClaim?.phone
      ? 'parent_phone'
      : 'none';

  const { links: allFamilyLinks } = programCode
    ? await fetchStudentFamilyLinksByFamilyProgram(programCode)
    : { links: [] as StudentFamilyLink[] };

  const scopedFamilyLinks = parentClaim
    ? allFamilyLinks.filter((link) => linkMatchesParentScope(link, parentClaim))
    : [];

  const unclaimedLinks = allFamilyLinks.filter((link) => !link.parent_claimed);
  const emailMatchedUnclaimed = allFamilyLinks.filter(
    (link) => !link.parent_claimed && linkMatchesParentScope(link, parentClaim ?? undefined),
  );

  const studentIds = Array.from(
    new Set(allFamilyLinks.map((link) => link.student_id).filter(Boolean)),
  );
  const { participants: participantsInScope } = await fetchParticipantsByIds(studentIds);
  const studentsTableAvailable = await probeStudentsTable();

  if (!programCode) findings.push('Missing active family program_code.');
  if (!claimConfirmed) findings.push('Parent claim is missing or not confirmed in local session.');
  if (linkingMethod === 'none') findings.push('No parent email/phone in claim context — dashboard uses parent email matching only (no auth user id).');
  if (allFamilyLinks.length && !scopedFamilyLinks.length) {
    findings.push('student_family_links exist for this program but none match the current parent contact.');
  }
  if (emailMatchedUnclaimed.length) {
    findings.push('Matching parent contact found on unclaimed link(s) — confirm claim instead of adding a child.');
  }
  if (studentIds.length && !participantsInScope.length) {
    findings.push('student_family_links reference student_id(s) but participants lookup returned no rows.');
  }
  if (!studentsTableAvailable) {
    findings.push('students table is not used — child records live in participants + student_family_links.');
  }

  const shouldShowAddChild = resolveFamilyAddChildVisibility({
    claimRequired: !claimConfirmed,
    visibleChildrenCount: scopedFamilyLinks.length,
    childrenSummaryCount: 0,
    familyLinks: allFamilyLinks,
  });

  const result: FamilyPortalLinkAuditResult = {
    programCode,
    familyUserId: null,
    participantId,
    parentClaim: parentClaim
      ? {
          ...parentClaim,
          email: parentClaim.email,
        }
      : null,
    claimConfirmed,
    linkingMethod,
    authUserId: null,
    studentsTableAvailable,
    participantsInScope: participantsInScope.map((row) => ({
      id: row.id,
      nickname: row.nickname,
      first_name: row.first_name,
      program_code: row.program_code,
    })),
    allFamilyLinks,
    scopedFamilyLinks,
    unclaimedLinks,
    emailMatchedUnclaimed,
    findings,
    shouldShowAddChild,
  };

  console.group('[FAMILY_PORTAL_LINK_AUDIT]');
  console.info('active_context', {
    program_code: programCode,
    family_user_id: null,
    participant_id: participantId,
    auth_user_id: null,
    linking_method: linkingMethod,
    parent_email: maskEmail(parentClaim?.email),
    parent_phone: parentClaim?.phone ? '***' : null,
    parent_last_name: parentClaim?.lastName ?? null,
    claim_confirmed: claimConfirmed,
  });
  console.info('student_family_links', {
    total_for_program: allFamilyLinks.length,
    scoped_to_parent: scopedFamilyLinks.length,
    unclaimed: unclaimedLinks.length,
    rows: allFamilyLinks.map((link) => ({
      id: link.id,
      student_id: link.student_id,
      camp_program_code: link.camp_program_code,
      family_program_code: link.family_program_code,
      parent_email: maskEmail(link.parent_email),
      parent_claimed: link.parent_claimed,
      claimed_at: link.claimed_at,
    })),
  });
  console.info('participants', {
    linked_student_ids: studentIds,
    rows_loaded: participantsInScope.map((row) => ({
      id: row.id,
      nickname: row.nickname,
      first_name: row.first_name,
      program_code: row.program_code,
    })),
  });
  console.info('students_table', { available: studentsTableAvailable });
  console.info('dashboard_queries', {
    visibility_source: 'resolveFamilyVisibleChildren → student_family_links + participants',
    progress_source: 'module_results + assessment_results_v2 scoped to allowed_student_ids',
    should_show_add_child: shouldShowAddChild,
  });
  if (findings.length) {
    console.warn('findings', findings);
  } else {
    console.info('findings', ['No linking anomalies detected for current session.']);
  }
  console.groupEnd();

  return result;
}
