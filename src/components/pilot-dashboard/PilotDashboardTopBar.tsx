import React from 'react';
import { BLUE_RIBBON_PILOT_TAG } from '../../data/pilotDashboardContent';
import PortalResourceSearch from '../shared/PortalResourceSearch';
import PortalSwitcherDropdown from '../shared/PortalSwitcherDropdown';

type PilotDashboardTopBarProps = {
  pageTitle: string;
  pageSubtitle?: string;
};

export default function PilotDashboardTopBar({ pageTitle, pageSubtitle }: PilotDashboardTopBarProps) {
  return (
    <header className="pilot-topbar">
      <div className="pilot-topbarLeft">
        <h1 className="pilot-topbarTitle">{pageTitle}</h1>
        {pageSubtitle ? <p className="pilot-topbarSubtitle">{pageSubtitle}</p> : null}
        <p className="pilot-topbarTag">{BLUE_RIBBON_PILOT_TAG}</p>
      </div>
      <div className="pilot-topbarRight">
        <PortalResourceSearch portal="facilitator" />
        <PortalSwitcherDropdown />
      </div>
    </header>
  );
}
