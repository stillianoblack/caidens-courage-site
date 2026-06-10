import {
  hasConfirmedParentClaim,
  readParentClaimContext,
  type ParentClaimContext,
} from '../config/parentClaimContext';
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
    label: 'Claimed',
    detail: 'Your parent profile is linked to your child.',
    variant: 'baseline-complete',
  },
  pending_claim: {
    label: 'Pending claim',
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
}): ParentClaimStatus {
  const parentClaim = input.parentClaim ?? readParentClaimContext();
  const meta = LABELS.claimed;

  if (input.claimRequired || !hasConfirmedParentClaim(parentClaim)) {
    return { state: 'pending_claim', ...LABELS.pending_claim };
  }

  if (input.visibleChildrenCount === 0) {
    return { state: 'needs_contact_update', ...LABELS.needs_contact_update };
  }

  const hasUnclaimedLink = input.familyLinks.some((link) => !link.parent_claimed);
  if (hasUnclaimedLink) {
    return { state: 'pending_claim', ...LABELS.pending_claim };
  }

  return { state: 'claimed', ...meta };
}
