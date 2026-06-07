import React from 'react';
import {
  BLUE_RIBBON_PILOT_BRAND,
  BLUE_RIBBON_PILOT_SUBBRAND,
  PILOT_SIDEBAR_NAV,
  type PilotSidebarNavId,
} from '../../data/pilotDashboardContent';
import PilotNavIcon from './PilotNavIcon';

type PilotDashboardSidebarProps = {
  activeId: PilotSidebarNavId;
  onSelect: (id: PilotSidebarNavId) => void;
};

export default function PilotDashboardSidebar({ activeId, onSelect }: PilotDashboardSidebarProps) {
  return (
    <aside className="pilot-rail" aria-label="Pilot dashboard navigation">
      <div className="pilot-railBrand">
        <p className="pilot-railBrandTitle">{BLUE_RIBBON_PILOT_BRAND}</p>
        <p className="pilot-railBrandSub">{BLUE_RIBBON_PILOT_SUBBRAND}</p>
      </div>

      <nav className="pilot-railNav" role="tablist" aria-label="Dashboard sections">
        <ul className="pilot-railNavList">
          {PILOT_SIDEBAR_NAV.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="tab"
                aria-selected={activeId === item.id}
                className={`pilot-railNavBtn${activeId === item.id ? ' pilot-railNavBtn--active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                <span className="pilot-railIcon">
                  <PilotNavIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
