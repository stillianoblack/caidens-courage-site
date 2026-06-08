import React from 'react';
import PortalHeader from '../portal/PortalHeader';

type PilotDashboardTopBarProps = {
  pageTitle: string;
  contextTitle?: string;
  contextSubtitle?: string;
};

export default function PilotDashboardTopBar({
  pageTitle,
  contextTitle,
  contextSubtitle,
}: PilotDashboardTopBarProps) {
  return (
    <PortalHeader
      pageTitle={pageTitle}
      contextTitle={contextTitle}
      contextSubtitle={contextSubtitle ?? 'Facilitator Portal'}
      portal="facilitator"
    />
  );
}
