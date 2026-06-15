import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trackSalesFunnel } from '../../lib/analytics';
import {
  FACILITATOR_MORE_NAV_ITEMS,
  facilitatorTabPath,
  resolveFacilitatorActiveTab,
} from '../../lib/facilitatorMobileNav';
import { openProgramGoals } from '../../lib/openProgramGoals';
import type { PilotPricingTier } from '../../types/pilotProgram';
import PilotNavIcon from './PilotNavIcon';
import PilotDrawer from './PilotDrawer';
import PilotProgramSettingsDrawer, {
  type ProgramSettingsTabId,
} from './PilotProgramSettingsDrawer';
import PilotUpgradePricingModal from './PilotUpgradePricingModal';
import { OPEN_FACILITATOR_PROGRAM_SETTINGS_EVENT } from '../../lib/openFacilitatorProgramSettings';

type FacilitatorMobileMoreDrawerProps = {
  open: boolean;
  onClose: () => void;
  onOpenMore?: () => void;
  programCode?: string;
  pricingTier?: PilotPricingTier;
};

export default function FacilitatorMobileMoreDrawer({
  open,
  onClose,
  onOpenMore,
  programCode,
  pricingTier,
}: FacilitatorMobileMoreDrawerProps) {
  const location = useLocation();
  const activeTab = resolveFacilitatorActiveTab(location.pathname, location.hash);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [openedSettingsFromMore, setOpenedSettingsFromMore] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<ProgramSettingsTabId>('program-info');

  useEffect(() => {
    const handleOpenSettings = (event: Event) => {
      const tab = (event as CustomEvent<{ tab?: ProgramSettingsTabId }>).detail?.tab ?? 'program-info';
      setActiveSettingsTab(tab);
      setOpenedSettingsFromMore(false);
      setDrawerOpen(true);
      onClose();
    };

    window.addEventListener(OPEN_FACILITATOR_PROGRAM_SETTINGS_EVENT, handleOpenSettings);
    return () => window.removeEventListener(OPEN_FACILITATOR_PROGRAM_SETTINGS_EVENT, handleOpenSettings);
  }, [onClose]);

  const openSupport = () => {
    trackSalesFunnel('support_pilot_clicked', { portal: 'facilitator' });
    trackSalesFunnel('pricing_viewed', { portal: 'facilitator' });
    setSupportOpen(true);
    onClose();
  };

  const openSettingsDrawer = (tab: ProgramSettingsTabId = 'program-info') => {
    setActiveSettingsTab(tab);
    setOpenedSettingsFromMore(true);
    setDrawerOpen(true);
    onClose();
  };

  const closeSettingsDrawer = () => {
    setDrawerOpen(false);
    if (openedSettingsFromMore) {
      setOpenedSettingsFromMore(false);
      onOpenMore?.();
    }
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      <PilotDrawer
        open={open}
        onClose={onClose}
        className="pilot-drawer facilitator-mobileMoreDrawer"
        titleId="facilitator-mobile-more-title"
      >
        <div className="pilot-drawerHead facilitator-mobileMoreHead">
          <div>
            <h2 id="facilitator-mobile-more-title" className="pilot-drawerTitle">
              More
            </h2>
            <p className="pilot-drawerSubtitle">Weekly tools, gallery, training, and program settings.</p>
          </div>
          <button type="button" className="pilot-drawerClose" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="pilot-drawerBody facilitator-mobileMoreBody">
          <div className="facilitator-mobileMoreCard">
            <ul className="facilitator-mobileMoreList">
              {FACILITATOR_MORE_NAV_ITEMS.map((item) => {
                const active = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <Link
                      to={facilitatorTabPath(item.id, location.pathname)}
                      className={[
                        'facilitator-mobileMoreRow',
                        active ? 'facilitator-mobileMoreRow--active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-current={active ? 'page' : undefined}
                      onClick={handleNavClick}
                    >
                      <span className="facilitator-mobileMoreRowIcon">
                        <PilotNavIcon name={item.id} />
                      </span>
                      <span className="facilitator-mobileMoreRowText">
                        <span className="facilitator-mobileMoreRowLabel">{item.label}</span>
                        {item.helper ? (
                          <span className="facilitator-mobileMoreRowHelper">{item.helper}</span>
                        ) : null}
                      </span>
                      <ChevronIcon />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ul className="facilitator-mobileMoreList facilitator-mobileMoreList--secondary">
              <li>
                <button
                  type="button"
                  className="facilitator-mobileMoreRow facilitator-mobileMoreRow--button"
                  onClick={() => {
                    openProgramGoals();
                    onClose();
                  }}
                >
                  <span className="facilitator-mobileMoreRowText">
                    <span className="facilitator-mobileMoreRowLabel">Program Goals</span>
                    <span className="facilitator-mobileMoreRowHelper">Focus areas for this pilot.</span>
                  </span>
                  <ChevronIcon />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="facilitator-mobileMoreRow facilitator-mobileMoreRow--button"
                  onClick={() => openSettingsDrawer('program-info')}
                >
                  <span className="facilitator-mobileMoreRowText">
                    <span className="facilitator-mobileMoreRowLabel">Program Settings</span>
                    <span className="facilitator-mobileMoreRowHelper">
                      Manage access, students, gallery, exports, and support.
                    </span>
                  </span>
                  <ChevronIcon />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </PilotDrawer>

      <PilotProgramSettingsDrawer
        open={drawerOpen}
        activeTab={activeSettingsTab}
        onTabChange={setActiveSettingsTab}
        onClose={closeSettingsDrawer}
        onOpenSupport={openSupport}
        programCode={programCode}
        layout="mobile"
      />

      <PilotUpgradePricingModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="facilitator-mobileMoreChevron"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L10.94 10 7.2 6.26a.75.75 0 111.06-1.06l4.24 4.24a.75.75 0 010 1.06l-4.24 4.24a.75.75 0 01-1.06 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
