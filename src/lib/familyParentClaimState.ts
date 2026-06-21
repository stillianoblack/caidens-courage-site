import { readParentClaimContext, type ParentClaimContext } from '../config/parentClaimContext';
import { isParentConnected, resolveParentEmailFromSources } from './portalIdentity';
import type { StudentFamilyLink } from './studentFamilyLinkService';

export type ParentClaimDisplayState = 'claimed' | 'pending_claim' | 'needs_contact_update';

export type ParentClaimStatus = {
  state: ParentClaimDisplayState;
  label: string;
  detail: string;
  variant: 'baseline-complete' | 'pending-review' | 'not-started';
};

const LABELS: Record<ParentClaimDisplayState, { label: string; detail: string; variant: ParentClaimStatus['variant'] }> = {
  claimed: {
    label: 'Connected',
    detail: 'Your parent profile is linked to your child.',
    variant: 'baseline-complete',
  },
  pending_claim: {
    label: 'Parent not connected',
    detail: 'Confirm your parent email to connect your child profile.',
    variant: 'pending-review',
  },
  needs_contact_update: {
    label: 'Needs contact update',
    detail: 'We could not match your contact info. Try the email or phone used at camp registration.',
    variant: 'not-started',
  },
};

export function resolveParentClaimState(input: {
  claimRequired: boolean;
  familyLinks: StudentFamilyLink[];
  visibleChildrenCount: number;
  parentClaim?: ParentClaimContext | null;
  programCode?: string;
}): ParentClaimStatus {
  const programCode =
    input.programCode?.trim() ||
    input.parentClaim?.programCode?.trim() ||
    readParentClaimContext()?.programCode?.trim() ||
    '';
  const parentClaim =
    input.parentClaim ?? (programCode ? readParentClaimContext({ programCode }) : readParentClaimContext());
  const meta = LABELS.claimed;

  if (input.visibleChildrenCount === 0) {
    return { state: 'needs_contact_update', ...LABELS.needs_contact_update };
  }

  const connected = programCode
    ? isParentConnected({
        programCode,
        familyLinks: input.familyLinks,
        parentClaim,
      })
    : false;

  if (!connected) {
    const falsePositiveClaim = input.familyLinks.some(
      (link) => link.parent_claimed && !resolveParentEmailFromSources({ programCode, parentClaim, parentLink: link }),
    );
    if (falsePositiveClaim) {
      console.warn('[PARENT_IDENTITY] parent_claimed without stored email', {
        program_code: programCode || null,
      });
    }
    return { state: 'pending_claim', ...LABELS.pending_claim };
  }

  return { state: 'claimed', ...meta };
}
