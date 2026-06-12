import React from 'react';
import { useLocation } from 'react-router-dom';
import PortalHeader from '../portal/PortalHeader';
import { familyGoalsPath } from '../../lib/familyPortalPaths';
import type { FamilyPortalNotification } from '../../hooks/useFamilyPortalNotifications';

type FamilyDashboardTopBarProps = {
  pageTitle: string;
  onOpenProgramGoals?: () => void;
  linkedCampLabel?: string | null;
  notifications?: FamilyPortalNotification[];
};

export default function FamilyDashboardTopBar({
  pageTitle,
  onOpenProgramGoals,
  linkedCampLabel = null,
  notifications = [],
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
    />
  );
}
