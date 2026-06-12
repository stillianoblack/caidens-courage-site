import React from 'react';
import { PortalPageIntro } from '../../portal-design-system';
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
  /** Show in-page title when no portal top bar is present (e.g. Admin Portal). */
  showPageTitle?: boolean;
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
  showPageTitle = false,
}: SettingsPageLayoutProps<T>) {
  return (
    <div className={panelClassName}>
      <header className="family-panelIntro">
        {toolbar ? (
          <div className="portal-settingsIntroRow">
            <div>
              {showPageTitle ? <h1 className="family-panelIntroTitle">{title}</h1> : null}
              <PortalPageIntro>{subtitle}</PortalPageIntro>
            </div>
            <div className="portal-settingsToolbar">{toolbar}</div>
          </div>
        ) : (
          <>
            {showPageTitle ? <h1 className="family-panelIntroTitle">{title}</h1> : null}
            <PortalPageIntro>{subtitle}</PortalPageIntro>
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
