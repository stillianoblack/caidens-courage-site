import React from 'react';

type SettingsTab<T extends string> = {
  id: T;
  label: string;
};

type SettingsTabRailProps<T extends string> = {
  tabs: SettingsTab<T>[];
  activeTab: T;
  onSelectTab: (tab: T) => void;
  ariaLabel?: string;
};

export default function SettingsTabRail<T extends string>({
  tabs,
  activeTab,
  onSelectTab,
  ariaLabel = 'Settings sections',
}: SettingsTabRailProps<T>) {
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
