import {
  hasConfirmedParentClaim,
  readParentClaimContext,
  type ParentClaimContext,
} from '../config/parentClaimContext';
import type { StudentFamilyLink } from './studentFamilyLinkService';
import { linkMatchesParentScope } from './studentFamilyLinkService';

export const PORTAL_ACCESS_NOT_FOUND_MESSAGE =
  "We couldn't find that access. Please check your code and try again.";

export const PORTAL_PIN_MISMATCH_MESSAGE = 'Program code or PIN did not match.';

export const PORTAL_CLAIM_PIN_MISMATCH_MESSAGE =
  'This claim code does not match that student PIN. Check the code from your facilitator or ask for a new link.';

export const PORTAL_EMAIL_NOT_CONNECTED_MESSAGE =
  'That email is not connected to this child or program.';

export function normalizePortalEmail(email?: string | null): string {
  return email?.trim().toLowerCase() ?? '';
}

export function isParentEmailOnLink(link: StudentFamilyLink | null | undefined): boolean {
  return Boolean(normalizePortalEmail(link?.parent_email));
}

/** Parent is connected only when the scoped link has a saved email and claim flag. */
export function isParentConnectedForLink(link: StudentFamilyLink | null | undefined): boolean {
  if (!link) return false;
  const email = normalizePortalEmail(link.parent_email);
  if (!email) {
    if (link.parent_claimed) {
      console.warn('[PARENT_IDENTITY] parent_claimed_without_email', {
        link_id: link.id,
        student_id: link.student_id,
      });
    }
    return false;
  }
  return Boolean(link.parent_claimed);
}

export function resolveParentEmailFromSources(input: {
  programCode: string;
  parentClaim?: ParentClaimContext | null;
  parentLink?: StudentFamilyLink | null;
}): string {
  const parentLink = input.parentLink ?? null;
  const linkEmail = parentLink?.parent_email?.trim() ?? '';

  if (isParentConnectedForLink(parentLink)) {
    return linkEmail;
  }

  if (parentLink && linkEmail && !parentLink.parent_claimed) {
    return '';
  }

  const parentClaim =
    input.parentClaim ?? readParentClaimContext({ programCode: input.programCode });
  if (!hasConfirmedParentClaim(parentClaim)) {
    return '';
  }

  const claimEmail = parentClaim?.email?.trim() ?? '';
  if (!claimEmail) return '';

  if (parentLink && !linkMatchesParentScope(parentLink, parentClaim ?? undefined)) {
    return '';
  }

  if (parentLink?.parent_claimed && !linkEmail) {
    return '';
  }

  return claimEmail;
}

export function isParentConnected(input: {
  programCode: string;
  familyLinks: StudentFamilyLink[];
  parentClaim?: ParentClaimContext | null;
  participantId?: string | null;
}): boolean {
  const programCode = input.programCode.trim();
  if (!programCode) return false;

  const scopedLinks = input.participantId?.trim()
    ? input.familyLinks.filter((link) => link.student_id === input.participantId?.trim())
    : input.familyLinks;

  if (scopedLinks.some((link) => isParentConnectedForLink(link))) {
    return true;
  }

  return Boolean(
    resolveParentEmailFromSources({
      programCode,
      parentClaim: input.parentClaim,
      parentLink: scopedLinks[0] ?? null,
    }),
  );
}
