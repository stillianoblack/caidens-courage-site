import React from 'react';
import PortalHeader from '../portal/PortalHeader';
import type { FamilyPortalNotification } from '../../hooks/useFamilyPortalNotifications';

type FamilyDashboardTopBarProps = {
  pageTitle: string;
  contextTitle?: string;
  contextSubtitle?: string;
  onOpenProgramGoals?: () => void;
  linkedCampLabel?: string | null;
  notifications?: FamilyPortalNotification[];
};

export default function FamilyDashboardTopBar({
  pageTitle,
  contextTitle,
  contextSubtitle,
  onOpenProgramGoals,
  linkedCampLabel = null,
  notifications = [],
}: FamilyDashboardTopBarProps) {
  return (
    <PortalHeader
      pageTitle={pageTitle}
      contextTitle={contextTitle}
      contextSubtitle={contextSubtitle}
      portal="family"
      onOpenProgramGoals={onOpenProgramGoals}
      linkedCampLabel={linkedCampLabel}
      notifications={notifications}
    />
  );
}
