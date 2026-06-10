import React from 'react';
import PortalHeader from '../portal/PortalHeader';

type PilotDashboardTopBarProps = {
  pageTitle: string;
  contextTitle?: string;
  contextSubtitle?: string;
  onOpenProgramGoals?: () => void;
};

export default function PilotDashboardTopBar({
  pageTitle,
  contextTitle,
  contextSubtitle,
  onOpenProgramGoals,
}: PilotDashboardTopBarProps) {
  return (
    <PortalHeader
      pageTitle={pageTitle}
      contextTitle={contextTitle}
      contextSubtitle={contextSubtitle ?? 'Facilitator Portal'}
      portal="facilitator"
      onOpenProgramGoals={onOpenProgramGoals}
    />
  );
}
