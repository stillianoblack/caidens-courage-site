import type { ParentConnectionStatus } from './studentPinService';
import { parentConnectionStatusLabel } from './studentPinService';
import type { StudentFamilyLink } from './studentFamilyLinkService';
import { readParentClaimContext, type ParentClaimContext } from '../config/parentClaimContext';
import {
  isParentConnectedForLink,
  normalizePortalEmail,
  resolveParentEmailFromSources,
} from './portalIdentity';
import { resolveLoggedInParentEmail } from './parentOnboardingState';
import { resolveParentGuardianDisplayName } from './studentDisplayName';

export function resolveFamilyPinAccessContext(input: {
  programCode: string;
  participantId: string;
  parentLink?: StudentFamilyLink | null;
  parentClaim?: ParentClaimContext | null;
}): { parentEmail: string; parentConnected: boolean } {
  const programCode = input.programCode.trim();
  const participantId = input.participantId.trim();
  const parentClaim =
    input.parentClaim ?? (programCode ? readParentClaimContext({ programCode }) : null);
  const parentLink = input.parentLink ?? null;
  const linkEmail = normalizePortalEmail(parentLink?.parent_email);
  const loggedInEmail = resolveLoggedInParentEmail({ programCode, parentClaim });

  const fromSources = resolveParentEmailFromSources({
    programCode,
    parentClaim,
    parentLink,
  });

  let parentEmail = fromSources || loggedInEmail || linkEmail;

  if (linkEmail && loggedInEmail && linkEmail === loggedInEmail) {
    parentEmail = linkEmail;
  }

  const emailOnChildLink =
    Boolean(linkEmail) &&
    parentLink?.student_id === participantId &&
    normalizePortalEmail(parentEmail) === linkEmail;

  const parentConnected =
    isParentConnectedForLink(parentLink) ||
    emailOnChildLink ||
    Boolean(fromSources && linkEmail && normalizePortalEmail(fromSources) === linkEmail);

  return { parentEmail, parentConnected };
}

export function resolveRosterParentConnectionStatus(link: StudentFamilyLink | undefined): {
  status: ParentConnectionStatus;
  label: string;
} {
  const parentEmail = link?.parent_email?.trim() || '';

  if (link?.parent_claimed && !parentEmail) {
    console.warn('[PARENT_IDENTITY] connected_missing_profile', {
      link_id: link.id,
      student_id: link.student_id,
      camp_program_code: link.camp_program_code,
    });
    return { status: 'connected', label: 'Connected — missing profile' };
  }

  const status: ParentConnectionStatus = isParentConnectedForLink(link)
    ? 'connected'
    : parentEmail
      ? 'invited'
      : 'unclaimed';

  if (status === 'connected') {
    const displayName = resolveParentGuardianDisplayName(link ?? {});
    if (displayName === '—') {
      console.warn('[PARENT_IDENTITY] connected_missing_name', {
        link_id: link?.id,
        student_id: link?.student_id,
        camp_program_code: link?.camp_program_code,
      });
      return { status, label: 'Connected — missing profile' };
    }
  }

  return { status, label: parentConnectionStatusLabel(status) };
}
