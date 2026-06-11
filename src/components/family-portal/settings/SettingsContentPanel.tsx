import React from 'react';

type SettingsContentPanelProps = {
  children: React.ReactNode;
};

export default function SettingsContentPanel({ children }: SettingsContentPanelProps) {
  return <div className="family-settingsContent family-resourceAssets">{children}</div>;
}
