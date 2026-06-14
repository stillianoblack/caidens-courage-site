import React from 'react';
import PortalHeader from '../portal/PortalHeader';
import type { FamilyPortalNotification } from '../../hooks/useFamilyPortalNotifications';

type FamilyDashboardTopBarProps = {
  pageTitle: string;
  linkedCampLabel?: string | null;
  notifications?: FamilyPortalNotification[];
  onOpenMobileNav?: () => void;
  mobileFamilySimplified?: boolean;
};

export default function FamilyDashboardTopBar({
  pageTitle,
  linkedCampLabel = null,
  notifications = [],
  onOpenMobileNav,
  mobileFamilySimplified = false,
}: FamilyDashboardTopBarProps) {
  return (
    <PortalHeader
      pageTitle={pageTitle}
      portal="family"
      linkedCampLabel={linkedCampLabel}
      notifications={notifications}
      onOpenMobileNav={onOpenMobileNav}
      mobileFamilySimplified={mobileFamilySimplified}
    />
  );
}
