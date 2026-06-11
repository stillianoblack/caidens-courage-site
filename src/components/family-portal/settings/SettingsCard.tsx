import React from 'react';

type SettingsCardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export default function SettingsCard({
  title,
  subtitle,
  children,
  className = '',
}: SettingsCardProps) {
  return (
    <div className={`family-settingsCard${className ? ` ${className}` : ''}`}>
      {title ? <h2 className="family-panelBlockTitle">{title}</h2> : null}
      {subtitle ? <p className="family-settingsCardSubtitle">{subtitle}</p> : null}
      {children}
    </div>
  );
}
