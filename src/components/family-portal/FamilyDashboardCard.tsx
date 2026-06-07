import React from 'react';
import { Link } from 'react-router-dom';

type FamilyDashboardCardProps = {
  title: string;
  description: string;
  cta: string;
  href: string;
  status?: string;
  statusTone?: 'available' | 'locked' | 'complete' | 'review';
};

export default function FamilyDashboardCard({
  title,
  description,
  cta,
  href,
  status,
  statusTone = 'available',
}: FamilyDashboardCardProps) {
  return (
    <Link to={href} className="family-dash-card">
      <h3 className="family-dash-cardTitle">{title}</h3>
      <p className="family-dash-cardDesc">{description}</p>
      <div className="family-dash-cardFoot">
        {status ? (
          <span className={`family-dash-pill family-dash-pill--${statusTone}`}>{status}</span>
        ) : (
          <span />
        )}
        <span className="family-dash-cta">{cta}</span>
      </div>
    </Link>
  );
}
