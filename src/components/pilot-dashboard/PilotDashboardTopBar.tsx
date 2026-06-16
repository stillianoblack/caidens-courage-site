import React from 'react';
import PortalHeader from '../portal/PortalHeader';

type PilotDashboardTopBarProps = {
  pageTitle: string;
  onOpenProgramGoals?: () => void;
  mobileFacilitatorNav?: boolean;
};

export default function PilotDashboardTopBar({
  pageTitle,
  onOpenProgramGoals,
  mobileFacilitatorNav = false,
}: PilotDashboardTopBarProps) {
  return (
    <PortalHeader
      pageTitle={pageTitle}
      portal="facilitator"
      onOpenProgramGoals={onOpenProgramGoals}
      mobileFacilitatorNav={mobileFacilitatorNav}
    />
  );
}
