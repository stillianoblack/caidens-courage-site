import React from 'react';
import { Link } from 'react-router-dom';
import PortalResourceSearch from '../shared/PortalResourceSearch';
import PortalSwitcherDropdown from '../shared/PortalSwitcherDropdown';
import FamilyLinkedCampBadge from '../family-portal/FamilyLinkedCampBadge';
import FamilyNotificationBell from '../family-portal/FamilyNotificationBell';
import type { FamilyPortalNotification } from '../../hooks/useFamilyPortalNotifications';
import '../portal-design-system/portal-design-system.css';
import './portal-header.css';

type PortalHeaderProps = {
  pageTitle: string;
  portal: 'family' | 'facilitator';
  onOpenProgramGoals?: () => void;
  /** Family portal: deep link to Settings → Family Goals tab. */
  programGoalsHref?: string;
  linkedCampLabel?: string | null;
  notifications?: FamilyPortalNotification[];
  onOpenMobileNav?: () => void;
  /** Family mobile: show coins + player chips; hide goals, search, and switcher. */
  mobileFamilySimplified?: boolean;
  mobileFamilyChips?: React.ReactNode;
};

export default function PortalHeader({
  pageTitle,
  portal,
  onOpenProgramGoals,
  programGoalsHref,
  linkedCampLabel = null,
  notifications = [],
  onOpenMobileNav,
  mobileFamilySimplified = false,
  mobileFamilyChips,
}: PortalHeaderProps) {
  return (
    <header
      className={[
        'portal-header',
        mobileFamilySimplified ? 'portal-header--familyMobile' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={mobileFamilySimplified ? pageTitle : undefined}
    >
      <div className="portal-headerLead">
        {mobileFamilySimplified ? (
          <img
            src="/images/icons/favcon_C.svg"
            alt="Caiden's Courage"
            className="portal-headerMobileLogo"
            width={44}
            height={44}
          />
        ) : null}
        {onOpenMobileNav ? (
          <button
            type="button"
            className="portal-headerMenuBtn"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 15.25z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : null}
        {!mobileFamilySimplified ? (
          <div className="portal-headerLeadText">
            <h1 className="portal-headerTitle">{pageTitle}</h1>
            {portal === 'family' && linkedCampLabel ? (
              <FamilyLinkedCampBadge label={linkedCampLabel} className="portal-headerCampBadge" />
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="portal-headerTools">
        {mobileFamilySimplified && mobileFamilyChips ? mobileFamilyChips : null}
        {portal === 'family' ? <FamilyNotificationBell items={notifications} /> : null}
        {portal === 'family' && programGoalsHref && !mobileFamilySimplified ? (
          <Link
            to={programGoalsHref}
            className="portal-headerGoalsBtn"
            aria-label="Family Goals"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            <span>Family Goals</span>
          </Link>
        ) : onOpenProgramGoals && !mobileFamilySimplified ? (
          <button
            type="button"
            className="portal-headerGoalsBtn"
            onClick={onOpenProgramGoals}
            aria-label="Program Goals"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            <span>Program Goals</span>
          </button>
        ) : null}
        {!mobileFamilySimplified ? (
          <PortalResourceSearch portal={portal} className="portal-headerSearch" collapsibleOnMobile />
        ) : null}
        {!mobileFamilySimplified || portal === 'family' ? (
          <PortalSwitcherDropdown
            className="portal-headerSwitcher"
            linkedCampLabel={portal === 'family' ? linkedCampLabel : undefined}
          />
        ) : null}
      </div>
    </header>
  );
}
