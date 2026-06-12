import React from 'react';
import { Link } from 'react-router-dom';

export type CoachInsightCardProps = {
  title: string;
  message: string;
  tone?: 'warning' | 'success' | 'info';
  href?: string;
};

export default function CoachInsightCard({
  title,
  message,
  tone = 'info',
  href,
}: CoachInsightCardProps) {
  const className = `pilot-coachInsight pilot-coachInsight--${tone}`;

  if (href) {
    return (
      <Link to={href} className={`${className} pilot-coachInsight--link`}>
        <p className="pilot-coachInsightTitle">{title}</p>
        <p className="pilot-coachInsightMessage">{message}</p>
      </Link>
    );
  }

  return (
    <div className={className}>
      <p className="pilot-coachInsightTitle">{title}</p>
      <p className="pilot-coachInsightMessage">{message}</p>
    </div>
  );
}
