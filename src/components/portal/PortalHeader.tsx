import React from 'react';
import PortalResourceSearch from '../shared/PortalResourceSearch';
import PortalSwitcherDropdown from '../shared/PortalSwitcherDropdown';
import FamilyNotificationBell from '../family-portal/FamilyNotificationBell';
import FocusCoinWalletBadge from '../rewards/FocusCoinWalletBadge';
import type { FamilyPortalNotification } from '../../hooks/useFamilyPortalNotifications';
import '../portal-design-system/portal-design-system.css';
import './portal-header.css';

type PortalHeaderProps = {
  pageTitle: string;
  portal: 'family' | 'facilitator';
  onOpenProgramGoals?: () => void;
  linkedCampLabel?: string | null;
  notifications?: FamilyPortalNotification[];
  onOpenMobileNav?: () => void;
  /** Family mobile: logo left, coins/player/bell/dropdown right. */
  mobileFamilySimplified?: boolean;
};

export default function PortalHeader({
  pageTitle,
  portal,
  onOpenProgramGoals,
  linkedCampLabel = null,
  notifications = [],
  onOpenMobileNav,
  mobileFamilySimplified = false,
}: PortalHeaderProps) {
  const logoSrc = `${process.env.PUBLIC_URL}/images/icons/favcon_C.svg`;

  if (portal === 'family') {
    return (
      <header
        className={[
          'portal-header',
          'portal-header--familyNav',
          mobileFamilySimplified ? 'portal-header--familyMobile familyPortalMobileHeader' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={pageTitle}
      >
        <div className="portal-headerFamilyTools">
          <img
            src={logoSrc}
            alt="Caiden's Courage"
            className="portal-headerBrandLogo familyPortalMobileHeader-logo"
            width={56}
            height={56}
          />
          <div className="portal-headerFamilyToolsEnd">
            <FocusCoinWalletBadge className="portal-headerCoins family-portalMobileChip" />
            <FamilyNotificationBell items={notifications} className="portal-headerBell" />
            <PortalSwitcherDropdown
              className="portal-headerSwitcher portal-headerFamilySwitcher familyPortalMobileHeader-switcher"
              linkedCampLabel={linkedCampLabel}
              familyNav
            />
          </div>
        </div>
      </header>
    );
  }

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
          </div>
        ) : null}
      </div>
      <div className="portal-headerTools">
        {onOpenProgramGoals && !mobileFamilySimplified ? (
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
        {!mobileFamilySimplified ? (
          <PortalSwitcherDropdown
            className="portal-headerSwitcher"
          />
        ) : null}
      </div>
    </header>
  );
}
