import React from 'react';
import PortalHeader from '../portal/PortalHeader';

type PilotDashboardTopBarProps = {
  pageTitle: string;
  onOpenProgramGoals?: () => void;
};

export default function PilotDashboardTopBar({
  pageTitle,
  onOpenProgramGoals,
}: PilotDashboardTopBarProps) {
  return (
    <PortalHeader
      pageTitle={pageTitle}
      portal="facilitator"
      onOpenProgramGoals={onOpenProgramGoals}
    />
  );
}
