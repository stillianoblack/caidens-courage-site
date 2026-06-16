import React from 'react';
import { Link } from 'react-router-dom';
import type { CampReadinessItem } from '../../../lib/campReadiness';

export type CoachReadinessItemProps = CampReadinessItem;

export default function CoachReadinessItem({
  label,
  count,
  status,
  href,
  onClick,
}: CoachReadinessItemProps) {
  const rowClass = [
    'pilot-coachReadinessItem',
    `pilot-coachReadinessItem--${status}`,
    href || onClick ? 'pilot-coachReadinessItem--interactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="pilot-coachReadinessLabel">{label}</span>
      <span className="pilot-coachReadinessCount">({count})</span>
    </>
  );

  if (href) {
    return (
      <li>
        <Link to={href} className={rowClass} onClick={onClick}>
          {content}
        </Link>
      </li>
    );
  }

  if (onClick) {
    return (
      <li>
        <button type="button" className={rowClass} onClick={onClick}>
          {content}
        </button>
      </li>
    );
  }

  return (
    <li>
      <div className={rowClass}>{content}</div>
    </li>
  );
}
