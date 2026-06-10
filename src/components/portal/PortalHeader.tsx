import React from 'react';
import PortalResourceSearch from '../shared/PortalResourceSearch';
import PortalSwitcherDropdown from '../shared/PortalSwitcherDropdown';
import FamilyLinkedCampBadge from '../family-portal/FamilyLinkedCampBadge';
import FamilyNotificationBell from '../family-portal/FamilyNotificationBell';
import type { FamilyPortalNotification } from '../../hooks/useFamilyPortalNotifications';
import '../portal-design-system/portal-design-system.css';
import './portal-header.css';

type PortalHeaderProps = {
  pageTitle: string;
  contextTitle?: string;
  contextSubtitle?: string;
  portal: 'family' | 'facilitator';
  onOpenProgramGoals?: () => void;
  linkedCampLabel?: string | null;
  notifications?: FamilyPortalNotification[];
};

export default function PortalHeader({
  pageTitle,
  contextTitle,
  contextSubtitle,
  portal,
  onOpenProgramGoals,
  linkedCampLabel = null,
  notifications = [],
}: PortalHeaderProps) {
  return (
    <header className="portal-header">
      <div className="portal-headerLead">
        <div className="portal-headerLeadText">
          <h1 className="portal-headerTitle">{pageTitle}</h1>
          {portal === 'family' && linkedCampLabel ? (
            <FamilyLinkedCampBadge label={linkedCampLabel} className="portal-headerCampBadge" />
          ) : null}
        </div>
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
        {portal === 'family' ? <FamilyNotificationBell items={notifications} /> : null}
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
