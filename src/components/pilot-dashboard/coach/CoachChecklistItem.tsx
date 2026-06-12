import React from 'react';
import { Link } from 'react-router-dom';
import type { FacilitatorCoachCheckStatus } from '../../../lib/facilitatorProgramCoachModel';

export type CoachChecklistItemProps = {
  label: string;
  description: string;
  status: FacilitatorCoachCheckStatus;
  warningText?: string;
  href?: string;
  onClick?: () => void;
};

function StatusIcon({ status }: { status: FacilitatorCoachCheckStatus }) {
  if (status === 'complete') {
    return (
      <span className="pilot-coachCheckIcon pilot-coachCheckIcon--complete" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={[
        'pilot-coachCheckIcon',
        status === 'warning' ? 'pilot-coachCheckIcon--warning' : 'pilot-coachCheckIcon--incomplete',
      ].join(' ')}
      aria-hidden="true"
    />
  );
}

export default function CoachChecklistItem({
  label,
  description,
  status,
  warningText,
  href,
  onClick,
}: CoachChecklistItemProps) {
  const isInteractive = Boolean(href || onClick);
  const rowClass = [
    'pilot-coachCheckItem',
    `pilot-coachCheckItem--${status}`,
    isInteractive ? 'pilot-coachCheckItem--interactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <StatusIcon status={status} />
      <span className="pilot-coachCheckCopy">
        <span className="pilot-coachCheckLabel">{label}</span>
        <span className="pilot-coachCheckDescription">{description}</span>
        {warningText ? <span className="pilot-coachCheckWarning">{warningText}</span> : null}
      </span>
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
