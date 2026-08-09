import React, { useEffect, useMemo, useRef, useState } from 'react';
import { readParentClaimContext } from '../../config/parentClaimContext';
import { useActiveParticipant } from '../../hooks/useActiveParticipant';
import type { FamilyChildSummary } from '../../lib/familyChildrenMetrics';
import {
  isParentEmailLinkedToChild,
  resolveLoggedInParentEmail,
  shouldShowFamilyOnboarding,
  syncLinkedParentKitSilently,
} from '../../lib/parentOnboardingState';
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
  const parentClaim = useMemo(
    () => readParentClaimContext({ programCode }),
    [programCode],
  );
  const { participant: activeChild } = useActiveParticipant();
  const participantId =
    activeChild?.participantId?.trim() || children[0]?.participantId?.trim() || '';
  const childDisplayName =
    activeChild?.displayName?.trim() || children[0]?.displayName?.trim() || undefined;
  const kitSyncedRef = useRef(false);

  const parentLink = useMemo(
    () => resolveParentLink(familyLinks, participantId, parentClaim),
    [familyLinks, parentClaim, participantId],
  );

  const loggedInEmail = useMemo(
    () => resolveLoggedInParentEmail({ programCode, parentClaim }),
    [parentClaim, programCode],
  );

  const hydratedEmail = useMemo(
    () =>
      loggedInEmail ||
      resolveParentEmailFromSources({
        programCode,
        parentClaim,
        parentLink,
      }),
    [loggedInEmail, parentClaim, parentLink, programCode],
  );

  const [visibility, setVisibility] = useState(() =>
    shouldShowFamilyOnboarding({
      programCode,
      parentSession: { parentEmail: loggedInEmail, parentClaim },
      familyLinks,
      activeChild: { participantId, displayName: childDisplayName },
      childDisplayName,
    }),
  );

  useEffect(() => {
    const nextVisibility = shouldShowFamilyOnboarding({
      programCode,
      parentSession: { parentEmail: loggedInEmail, parentClaim },
      familyLinks,
      activeChild: { participantId, displayName: childDisplayName },
      childDisplayName,
    });

    setVisibility((currentVisibility) =>
      currentVisibility.show === nextVisibility.show &&
      currentVisibility.goalsOnly === nextVisibility.goalsOnly
        ? currentVisibility
        : nextVisibility,
    );
  }, [
    childDisplayName,
    familyLinks,
    loggedInEmail,
    parentClaim,
    participantId,
    programCode,
  ]);

  useEffect(() => {
    if (visibility.show || kidFacingRoute || kitSyncedRef.current) return;
    if (!loggedInEmail || !participantId) return;

    const linked =
      isParentEmailLinkedToChild({
        parentEmail: loggedInEmail,
        participantId,
        familyLinks,
      }) ||
      Boolean(
        parentLink?.parent_email?.trim() &&
          parentLink.parent_claimed &&
          resolveParentEmailFromSources({ programCode, parentClaim, parentLink }),
      );

    if (!linked) return;

    kitSyncedRef.current = true;
    syncLinkedParentKitSilently({
      parentEmail: loggedInEmail,
      programCode,
      participantId,
    });
  }, [
    familyLinks,
    kidFacingRoute,
    loggedInEmail,
    parentClaim,
    parentLink,
    participantId,
    programCode,
    visibility.show,
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
