import React from 'react';
import { Link } from 'react-router-dom';
import type { FamilyChildPlayReadiness } from '../../lib/familyChildReadiness';
import './family-children-dashboard-grid.css';

type WeeklySetupReminderCardProps = {
  childrenNeedingSetup: FamilyChildPlayReadiness[];
  baselinePath: string;
};

export default function WeeklySetupReminderCard({
  childrenNeedingSetup,
  baselinePath,
}: WeeklySetupReminderCardProps) {
  if (childrenNeedingSetup.length === 0) return null;

  return (
    <section className="family-weeklySetupReminder" aria-labelledby="weekly-setup-reminder-title">
      <h3 id="weekly-setup-reminder-title" className="family-weeklySetupReminderTitle">
        Some profiles still need B-4 Check-In
      </h3>
      <p className="family-weeklySetupReminderBody">
        {childrenNeedingSetup.map((child) => child.displayName).join(', ')} still need setup before
        their adventure progress can save correctly.
      </p>
      <div className="family-weeklySetupReminderList">
        {childrenNeedingSetup.map((child) => (
          <Link key={child.participantId} to={baselinePath} className="family-weeklySetupReminderChip">
            Complete setup for {child.displayName}
          </Link>
        ))}
      </div>
    </section>
  );
}
