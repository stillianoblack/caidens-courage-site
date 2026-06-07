import React from 'react';
import { Link } from 'react-router-dom';

type PilotDashboardCardProps = {
  title: string;
  description: string;
  cta: string;
  href: string;
  external?: boolean;
};

export default function PilotDashboardCard({
  title,
  description,
  cta,
  href,
  external = false,
}: PilotDashboardCardProps) {
  const content = (
    <>
      <h3 className="pilot-dash-cardTitle">{title}</h3>
      <p className="pilot-dash-cardDesc">{description}</p>
      <div className="pilot-dash-cardFoot">
        <span className="pilot-dash-cta">{cta}</span>
      </div>
    </>
  );

  if (external) {
    return (
      <a href={href} className="pilot-dash-card" target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link to={href} className="pilot-dash-card">
      {content}
    </Link>
  );
}
