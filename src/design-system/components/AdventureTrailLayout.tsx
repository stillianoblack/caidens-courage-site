import React from 'react';
import './adventure-trail.css';

export type AdventureTrailLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

/** Two-column shell: trail on the left, empty aside reserved for future coach/reminders. */
export default function AdventureTrailLayout({ children, className }: AdventureTrailLayoutProps) {
  return (
    <div className={['adventureTrailLayout', className].filter(Boolean).join(' ')}>
      <div className="adventureTrailLayoutMain">{children}</div>
      <div className="adventureTrailLayoutAside" aria-hidden="true" />
    </div>
  );
}
