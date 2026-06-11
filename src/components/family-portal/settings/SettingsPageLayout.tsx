import React from 'react';
import type { FamilySettingsTabId } from '../../../data/familySettingsContent';
import SettingsContentPanel from './SettingsContentPanel';
import SettingsTabRail from './SettingsTabRail';

type SettingsTab = {
  id: FamilySettingsTabId;
  label: string;
};

type SettingsPageLayoutProps = {
  title: string;
  subtitle: string;
  tabs: SettingsTab[];
  activeTab: FamilySettingsTabId;
  onSelectTab: (tab: FamilySettingsTabId) => void;
  children: React.ReactNode;
};

export default function SettingsPageLayout({
  title,
  subtitle,
  tabs,
  activeTab,
  onSelectTab,
  children,
}: SettingsPageLayoutProps) {
  return (
    <div className="family-panel family-panel--settings">
      <header className="family-panelIntro">
        <h1 className="family-panelIntroTitle">{title}</h1>
        <p className="family-panelIntroSubtitle">{subtitle}</p>
      </header>

      <div className="family-settingsLayout family-resourceLayout">
        <SettingsTabRail tabs={tabs} activeTab={activeTab} onSelectTab={onSelectTab} />
        <SettingsContentPanel>{children}</SettingsContentPanel>
      </div>
    </div>
  );
}
