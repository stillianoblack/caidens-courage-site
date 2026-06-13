import React from 'react';
import { useLocation } from 'react-router-dom';
import PortalHeader from '../portal/PortalHeader';
import FamilyPortalMobileHeaderChips from './FamilyPortalMobileHeaderChips';
import { familyGoalsPath } from '../../lib/familyPortalPaths';
import type { FamilyPortalNotification } from '../../hooks/useFamilyPortalNotifications';

type FamilyDashboardTopBarProps = {
  pageTitle: string;
  onOpenProgramGoals?: () => void;
  linkedCampLabel?: string | null;
  notifications?: FamilyPortalNotification[];
  onOpenMobileNav?: () => void;
  mobileFamilySimplified?: boolean;
};

export default function FamilyDashboardTopBar({
  pageTitle,
  onOpenProgramGoals,
  linkedCampLabel = null,
  notifications = [],
  onOpenMobileNav,
  mobileFamilySimplified = false,
}: FamilyDashboardTopBarProps) {
  const location = useLocation();
  const programGoalsHref = familyGoalsPath(location.pathname);

  return (
    <PortalHeader
      pageTitle={pageTitle}
      portal="family"
      programGoalsHref={programGoalsHref}
      onOpenProgramGoals={onOpenProgramGoals}
      linkedCampLabel={linkedCampLabel}
      notifications={notifications}
      onOpenMobileNav={onOpenMobileNav}
      mobileFamilySimplified={mobileFamilySimplified}
      mobileFamilyChips={
        mobileFamilySimplified ? <FamilyPortalMobileHeaderChips /> : undefined
      }
    />
  );
}
