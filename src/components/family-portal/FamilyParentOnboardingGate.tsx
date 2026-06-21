import React, { useEffect, useMemo, useState } from 'react';
import { readParentClaimContext } from '../../config/parentClaimContext';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import type { FamilyChildSummary } from '../../lib/familyChildrenMetrics';
import { resolveFamilyOnboardingVisibility } from '../../lib/parentOnboardingState';
import type { StudentFamilyLink } from '../../lib/studentFamilyLinkService';
import { linkMatchesParentScope } from '../../lib/studentFamilyLinkService';
import { resolveParentEmailFromSources } from '../../lib/portalIdentity';
import ParentFirstLoginWizard from './ParentFirstLoginWizard';

type FamilyParentOnboardingGateProps = {
  programCode: string;
  campProgramCode?: string | null;
  kidFacingRoute: boolean;
  familyLinks: StudentFamilyLink[];
  children: FamilyChildSummary[];
  onFinished: () => void | Promise<void>;
};

function resolveParentLink(
  familyLinks: StudentFamilyLink[],
  participantId: string | undefined,
  parentClaim: ReturnType<typeof readParentClaimContext>,
): StudentFamilyLink | null {
  if (!participantId) return null;
  const scoped = familyLinks.find((link) => link.student_id === participantId);
  if (scoped) return scoped;
  if (!parentClaim) return null;
  return familyLinks.find((link) => linkMatchesParentScope(link, parentClaim)) ?? null;
}

export default function FamilyParentOnboardingGate({
  programCode,
  campProgramCode = null,
  kidFacingRoute,
  familyLinks,
  children,
  onFinished,
}: FamilyParentOnboardingGateProps) {
  const parentClaim = readParentClaimContext({ programCode });
  const { participant: activeChild } = useActiveParticipant();
  const participantId =
    activeChild?.participantId?.trim() || children[0]?.participantId?.trim() || '';
  const childDisplayName =
    activeChild?.displayName?.trim() || children[0]?.displayName?.trim() || undefined;

  const parentLink = useMemo(
    () => resolveParentLink(familyLinks, participantId, parentClaim),
    [familyLinks, parentClaim, participantId],
  );

  const hydratedEmail = useMemo(
    () =>
      resolveParentEmailFromSources({
        programCode,
        parentClaim,
        parentLink,
      }),
    [parentClaim, parentLink, programCode],
  );

  const [visibility, setVisibility] = useState(() =>
    resolveFamilyOnboardingVisibility({
      programCode,
      participantId,
      parentEmail: hydratedEmail || parentClaim?.email,
      parentClaim,
      familyLinks,
      childDisplayName,
    }),
  );

  useEffect(() => {
    setVisibility(
      resolveFamilyOnboardingVisibility({
        programCode,
        participantId,
        parentEmail: hydratedEmail || parentClaim?.email,
        parentClaim,
        familyLinks,
        childDisplayName,
      }),
    );
  }, [
    childDisplayName,
    familyLinks,
    hydratedEmail,
    parentClaim,
    participantId,
    programCode,
  ]);

  return (
    <ParentFirstLoginWizard
      open={visibility.show && !kidFacingRoute}
      goalsOnly={visibility.goalsOnly}
      initialEmail={hydratedEmail || parentClaim?.email || ''}
      initialFirstName={parentLink?.parent_first_name?.trim() || parentClaim?.firstName || ''}
      initialLastName={parentLink?.parent_last_name?.trim() || parentClaim?.lastName || ''}
      initialPhone={parentLink?.parent_phone?.trim() || parentClaim?.phone || ''}
      campProgramCode={campProgramCode}
      onFinished={onFinished}
    />
  );
}
