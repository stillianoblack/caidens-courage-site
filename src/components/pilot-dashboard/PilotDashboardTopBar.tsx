import React from 'react';
import PortalHeader from '../portal/PortalHeader';

type PilotDashboardTopBarProps = {
  pageTitle: string;
  onOpenProgramGoals?: () => void;
  onOpenShareInvite?: () => void;
  mobileFacilitatorNav?: boolean;
};

export default function PilotDashboardTopBar({
  pageTitle,
  onOpenProgramGoals,
  onOpenShareInvite,
  mobileFacilitatorNav = false,
}: PilotDashboardTopBarProps) {
  return (
    <PortalHeader
      pageTitle={pageTitle}
      portal="facilitator"
      onOpenProgramGoals={onOpenProgramGoals}
      onOpenShareInvite={onOpenShareInvite}
      mobileFacilitatorNav={mobileFacilitatorNav}
    />
  );
}
