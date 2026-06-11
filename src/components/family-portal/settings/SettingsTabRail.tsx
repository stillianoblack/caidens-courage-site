import React from 'react';
import type { FamilySettingsTabId } from '../../../data/familySettingsContent';

type SettingsTab = {
  id: FamilySettingsTabId;
  label: string;
};

type SettingsTabRailProps = {
  tabs: SettingsTab[];
  activeTab: FamilySettingsTabId;
  onSelectTab: (tab: FamilySettingsTabId) => void;
  ariaLabel?: string;
};

export default function SettingsTabRail({
  tabs,
  activeTab,
  onSelectTab,
  ariaLabel = 'Settings sections',
}: SettingsTabRailProps) {
  return (
    <div className="family-settingsCategories family-resourceCategories" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`family-settingsCatBtn family-resourceCatBtn${activeTab === tab.id ? ' family-resourceCatBtn--active' : ''}`}
          onClick={() => onSelectTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
