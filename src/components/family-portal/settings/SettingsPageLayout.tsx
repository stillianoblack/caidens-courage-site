import React from 'react';
import SettingsContentPanel from './SettingsContentPanel';
import SettingsTabRail from './SettingsTabRail';

type SettingsTab<T extends string> = {
  id: T;
  label: string;
};

type SettingsPageLayoutProps<T extends string> = {
  title: string;
  subtitle: string;
  tabs: SettingsTab<T>[];
  activeTab: T;
  onSelectTab: (tab: T) => void;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  panelClassName?: string;
  tabAriaLabel?: string;
};

export default function SettingsPageLayout<T extends string>({
  title,
  subtitle,
  tabs,
  activeTab,
  onSelectTab,
  children,
  toolbar,
  panelClassName = 'family-panel family-panel--settings',
  tabAriaLabel,
}: SettingsPageLayoutProps<T>) {
  return (
    <div className={panelClassName}>
      <header className="family-panelIntro">
        {toolbar ? (
          <div className="portal-settingsIntroRow">
            <div>
              <h1 className="family-panelIntroTitle">{title}</h1>
              <p className="family-panelIntroSubtitle">{subtitle}</p>
            </div>
            <div className="portal-settingsToolbar">{toolbar}</div>
          </div>
        ) : (
          <>
            <h1 className="family-panelIntroTitle">{title}</h1>
            <p className="family-panelIntroSubtitle">{subtitle}</p>
          </>
        )}
      </header>

      <div className="family-settingsLayout family-resourceLayout">
        <SettingsTabRail
          tabs={tabs}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          ariaLabel={tabAriaLabel}
        />
        <SettingsContentPanel>{children}</SettingsContentPanel>
      </div>
    </div>
  );
}
