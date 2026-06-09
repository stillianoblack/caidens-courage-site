import React, { useState } from 'react';
import { trackSalesFunnel } from '../../lib/analytics';
import type { PilotPricingTier } from '../../types/pilotProgram';
import PilotProgramSettingsDrawer, {
  type ProgramSettingsTabId,
} from './PilotProgramSettingsDrawer';
import PilotUpgradePricingModal from './PilotUpgradePricingModal';

type PilotProgramSettingsCardProps = {
  programCode?: string;
  pricingTier?: PilotPricingTier;
};

const MENU_ITEMS: Array<{ tab: ProgramSettingsTabId; label: string }> = [
  { tab: 'program-info', label: 'Program Info' },
  { tab: 'facilitators', label: 'Facilitators' },
  { tab: 'access-codes', label: 'Access Codes' },
  { tab: 'student-data', label: 'Student Data' },
  { tab: 'exports', label: 'Exports' },
  { tab: 'support', label: 'Support' },
];

export default function PilotProgramSettingsCard({
  programCode,
  pricingTier,
}: PilotProgramSettingsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProgramSettingsTabId>('program-info');

  const openSupport = () => {
    trackSalesFunnel('support_pilot_clicked', { portal: 'facilitator' });
    trackSalesFunnel('pricing_viewed', { portal: 'facilitator' });
    setSupportOpen(true);
  };

  const openTab = (tab: ProgramSettingsTabId) => {
    if (tab === 'support') {
      openSupport();
      return;
    }
    setActiveTab(tab);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="pilot-railFooter">
        <div className={`pilot-railSettings${expanded ? ' pilot-railSettings--expanded' : ''}`}>
          <button
            type="button"
            className="pilot-railSettingsToggle"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            <span>Program Settings</span>
            <span className="pilot-railSettingsCaret" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </button>

          {expanded ? (
            <div className="pilot-railSettingsMenu">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.tab}
                  type="button"
                  className="pilot-railSettingsBtn"
                  onClick={() => openTab(item.tab)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {pricingTier === 'camp_pilot' ? (
          <div className="pilot-railSupport">
            <p className="pilot-railSupportTitle">Upgrade Your Plan</p>
            <p className="pilot-railSupportCopy">
              Support your pilot and unlock expanded program access.
            </p>
            <button type="button" className="pilot-railSupportBtn" onClick={openSupport}>
              Support Pilot
            </button>
          </div>
        ) : null}
      </div>

      <PilotProgramSettingsDrawer
        open={drawerOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={() => setDrawerOpen(false)}
        onOpenSupport={openSupport}
        programCode={programCode}
      />

      <PilotUpgradePricingModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}
