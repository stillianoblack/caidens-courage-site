import React from 'react';

type PilotDashboardSectionProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export default function PilotDashboardSection({
  title,
  subtitle,
  children,
  className = '',
}: PilotDashboardSectionProps) {
  return (
    <section className={`pilot-dash-section ${className}`.trim()}>
      <div className="pilot-dash-sectionHead">
        <h2 className="pilot-dash-sectionTitle">{title}</h2>
        {subtitle ? <p className="pilot-dash-sectionSub">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
