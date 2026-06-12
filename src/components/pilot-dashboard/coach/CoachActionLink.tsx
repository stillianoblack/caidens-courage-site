import React from 'react';
import { Link } from 'react-router-dom';

export type CoachActionLinkProps = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export default function CoachActionLink({ label, href, onClick }: CoachActionLinkProps) {
  if (href) {
    return (
      <Link to={href} className="pilot-coachActionLink">
        {label}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" className="pilot-coachActionLink" onClick={onClick}>
        {label}
      </button>
    );
  }

  return <span className="pilot-coachActionLink pilot-coachActionLink--static">{label}</span>;
}
