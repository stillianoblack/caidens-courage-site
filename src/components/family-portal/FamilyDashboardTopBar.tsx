import React from 'react';
import PortalHeader from '../portal/PortalHeader';

type FamilyDashboardTopBarProps = {
  pageTitle: string;
  contextTitle?: string;
  contextSubtitle?: string;
  onOpenProgramGoals?: () => void;
};

export default function FamilyDashboardTopBar({
  pageTitle,
  contextTitle,
  contextSubtitle,
  onOpenProgramGoals,
}: FamilyDashboardTopBarProps) {
  return (
    <PortalHeader
      pageTitle={pageTitle}
      contextTitle={contextTitle}
      contextSubtitle={contextSubtitle}
      portal="family"
      onOpenProgramGoals={onOpenProgramGoals}
    />
  );
}
