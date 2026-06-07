import React from 'react';
import { BLUE_RIBBON_PILOT_TAG } from '../../data/pilotDashboardContent';
import PortalResourceSearch from '../shared/PortalResourceSearch';
import PortalSwitcherDropdown from '../shared/PortalSwitcherDropdown';

type PilotDashboardTopBarProps = {
  pageTitle: string;
};

export default function PilotDashboardTopBar({ pageTitle }: PilotDashboardTopBarProps) {
  return (
    <header className="pilot-topbar">
      <div className="pilot-topbarLeft">
        <h1 className="pilot-topbarTitle">{pageTitle}</h1>
        <p className="pilot-topbarTag">{BLUE_RIBBON_PILOT_TAG}</p>
      </div>
      <div className="pilot-topbarRight">
        <PortalResourceSearch portal="facilitator" />
        <PortalSwitcherDropdown />
      </div>
    </header>
  );
}
