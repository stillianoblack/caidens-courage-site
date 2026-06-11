import React from 'react';
import PortalHeader from '../portal/PortalHeader';
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
  return (
    <PortalHeader
      pageTitle={pageTitle}
      portal="family"
      onOpenProgramGoals={onOpenProgramGoals}
      linkedCampLabel={linkedCampLabel}
      notifications={notifications}
    />
  );
}
