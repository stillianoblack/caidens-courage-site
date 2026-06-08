import React from 'react';
import PortalResourceSearch from '../shared/PortalResourceSearch';
import PortalSwitcherDropdown from '../shared/PortalSwitcherDropdown';
import './portal-header.css';

type PortalHeaderProps = {
  pageTitle: string;
  contextTitle?: string;
  contextSubtitle?: string;
  portal: 'family' | 'facilitator';
};

export default function PortalHeader({
  pageTitle,
  contextTitle,
  contextSubtitle,
  portal,
}: PortalHeaderProps) {
  return (
    <header className="portal-header">
      <div className="portal-headerLeft">
        <h1 className="portal-headerTitle">{pageTitle}</h1>
      </div>
      <div className="portal-headerRight">
        {contextTitle || contextSubtitle ? (
          <div className="portal-headerContext">
            {contextTitle ? <p className="portal-headerContextTitle">{contextTitle}</p> : null}
            {contextSubtitle ? (
              <p className="portal-headerContextSubtitle">{contextSubtitle}</p>
            ) : null}
          </div>
        ) : null}
        <PortalResourceSearch portal={portal} />
        <PortalSwitcherDropdown />
      </div>
    </header>
  );
}
