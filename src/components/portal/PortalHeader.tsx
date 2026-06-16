import React from 'react';
import PortalResourceSearch from '../shared/PortalResourceSearch';
import PortalSwitcherDropdown from '../shared/PortalSwitcherDropdown';
import FamilyNotificationBell from '../family-portal/FamilyNotificationBell';
import FocusCoinWalletBadge from '../rewards/FocusCoinWalletBadge';
import MobilePortalHeaderLead from './MobilePortalHeaderLead';
import { getMobilePortalBranding } from '../../lib/getMobilePortalBranding';
import { useGameplayPlayerChip } from '../../hooks/useGameplayPlayerChip';
import type { FamilyPortalNotification } from '../../hooks/useFamilyPortalNotifications';
import '../portal-design-system/portal-design-system.css';
import '../../design-system/components/brand-logo.css';
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
  /** Facilitator mobile: logo + title + dropdown in one row; search below. */
  mobileFacilitatorNav?: boolean;
};

function FacilitatorGoalsButton({ onOpenProgramGoals }: { onOpenProgramGoals: () => void }) {
  return (
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
  );
}

export default function PortalHeader({
  pageTitle,
  portal,
  onOpenProgramGoals,
  linkedCampLabel = null,
  notifications = [],
  onOpenMobileNav,
  mobileFamilySimplified = false,
  mobileFacilitatorNav = false,
}: PortalHeaderProps) {
  const playerChip = useGameplayPlayerChip();
  const familyMobileBranding = mobileFamilySimplified
    ? getMobilePortalBranding({ familyDisplayName: playerChip.displayName, role: 'family' })
    : null;
  const facilitatorMobileBranding = mobileFacilitatorNav
    ? getMobilePortalBranding({ role: 'facilitator' })
    : null;

  if (portal === 'family') {
    if (mobileFamilySimplified && familyMobileBranding) {
      return (
        <header
          className={[
            'portal-header',
            'portal-header--familyNav',
            'portal-header--familyMobile',
            'familyPortalMobileHeader',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={pageTitle}
        >
          <div className="portal-headerFamilyTools">
            <MobilePortalHeaderLead
              logoSrc={familyMobileBranding.logoSrc}
              className="familyPortalMobileHeader-lead"
            />
            <div className="portal-headerFamilyToolsEnd">
              <FocusCoinWalletBadge className="portal-headerCoins family-portalMobileChip" />
              <FamilyNotificationBell items={notifications} className="portal-headerBell" />
              <PortalSwitcherDropdown
                className="portal-headerSwitcher portal-headerFamilySwitcher familyPortalMobileHeader-switcher"
                linkedCampLabel={linkedCampLabel}
                familyNav
                mobileVariant="family"
              />
            </div>
          </div>
        </header>
      );
    }

    return (
      <header className="portal-header portal-header--familyDesktop" aria-label={pageTitle}>
        <div className="portal-headerLead">
          <div className="portal-headerLeadText">
            <h1 className="portal-headerTitle">{pageTitle}</h1>
            {linkedCampLabel ? (
              <p className="portal-headerCampBadge">{linkedCampLabel}</p>
            ) : null}
          </div>
        </div>
        <div className="portal-headerTools portal-headerTools--familyDesktop">
          <FocusCoinWalletBadge className="portal-headerCoins" />
          <FamilyNotificationBell items={notifications} className="portal-headerBell" />
          <PortalSwitcherDropdown
            className="portal-headerSwitcher portal-headerFamilySwitcher"
            linkedCampLabel={linkedCampLabel}
            familyNav
          />
        </div>
      </header>
    );
  }

  if (mobileFacilitatorNav && facilitatorMobileBranding) {
    return (
      <header
        className="portal-header portal-header--facilitatorMobile facilitatorPortalMobileHeader"
        aria-label={pageTitle}
      >
        <div className="facilitatorPortalMobileHeader-row">
          <MobilePortalHeaderLead
            logoSrc={facilitatorMobileBranding.logoSrc}
            className="facilitatorPortalMobileHeader-lead"
          />
          <PortalSwitcherDropdown
            className="portal-headerSwitcher facilitatorPortalMobileHeader-switcher"
            mobileVariant="facilitator"
          />
        </div>
        <PortalResourceSearch
          portal={portal}
          className="portal-headerSearch facilitatorPortalMobileHeader-search"
          collapsibleOnMobile
        />
      </header>
    );
  }

  return (
    <header className="portal-header portal-header--facilitatorDesktop" aria-label={pageTitle}>
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
        <div className="portal-headerLeadText">
          <h1 className="portal-headerTitle">{pageTitle}</h1>
        </div>
      </div>
      <div className="portal-headerTools portal-headerTools--facilitatorDesktop">
        {onOpenProgramGoals ? <FacilitatorGoalsButton onOpenProgramGoals={onOpenProgramGoals} /> : null}
        <PortalResourceSearch portal={portal} className="portal-headerSearch" collapsibleOnMobile />
        <PortalSwitcherDropdown className="portal-headerSwitcher" />
      </div>
    </header>
  );
}
