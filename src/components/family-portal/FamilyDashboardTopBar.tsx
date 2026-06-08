import React from 'react';
import PortalHeader from '../portal/PortalHeader';

type FamilyDashboardTopBarProps = {
  pageTitle: string;
  contextTitle?: string;
  contextSubtitle?: string;
};

export default function FamilyDashboardTopBar({
  pageTitle,
  contextTitle,
  contextSubtitle,
}: FamilyDashboardTopBarProps) {
  return (
    <PortalHeader
      pageTitle={pageTitle}
      contextTitle={contextTitle}
      contextSubtitle={contextSubtitle}
      portal="family"
    />
  );
}
