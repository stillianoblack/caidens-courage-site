import React from 'react';
import { FAMILY_PORTAL_TAG } from '../../data/familyPortalContent';
import PortalResourceSearch from '../shared/PortalResourceSearch';
import PortalSwitcherDropdown from '../shared/PortalSwitcherDropdown';

type FamilyDashboardTopBarProps = {
  pageTitle: string;
  pageSubtitle?: string;
};

export default function FamilyDashboardTopBar({ pageTitle, pageSubtitle }: FamilyDashboardTopBarProps) {
  return (
    <header className="family-topbar">
      <div>
        <h1 className="family-topbarTitle">{pageTitle}</h1>
        {pageSubtitle ? <p className="family-topbarSubtitle">{pageSubtitle}</p> : null}
        <p className="family-topbarTag">{FAMILY_PORTAL_TAG}</p>
      </div>
      <div className="family-topbarRight">
        <PortalResourceSearch portal="family" />
        <PortalSwitcherDropdown />
      </div>
    </header>
  );
}
