import React from 'react';
import PortalResourceSearch from '../shared/PortalResourceSearch';
import PortalSwitcherDropdown from '../shared/PortalSwitcherDropdown';
import '../portal-design-system/portal-design-system.css';
import './portal-header.css';

type PortalHeaderProps = {
  pageTitle: string;
  contextTitle?: string;
  contextSubtitle?: string;
  portal: 'family' | 'facilitator';
  onOpenProgramGoals?: () => void;
};

export default function PortalHeader({
  pageTitle,
  contextTitle,
  contextSubtitle,
  portal,
  onOpenProgramGoals,
}: PortalHeaderProps) {
  return (
    <header className="portal-header">
      <div className="portal-headerLead">
        <h1 className="portal-headerTitle">{pageTitle}</h1>
        {contextTitle || contextSubtitle ? (
          <div className="portal-headerContext">
            {contextTitle ? <p className="portal-headerContextTitle">{contextTitle}</p> : null}
            {contextSubtitle ? (
              <p className="portal-headerContextSubtitle">{contextSubtitle}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="portal-headerTools">
        {onOpenProgramGoals ? (
          <button
            type="button"
            className="portal-headerGoalsBtn"
            onClick={onOpenProgramGoals}
            aria-label={portal === 'family' ? 'Family Goals' : 'Program Goals'}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            <span>{portal === 'family' ? 'Family Goals' : 'Program Goals'}</span>
          </button>
        ) : null}
        <PortalResourceSearch portal={portal} className="portal-headerSearch" collapsibleOnMobile />
      </div>
      <PortalSwitcherDropdown className="portal-headerSwitcher" />
    </header>
  );
}
