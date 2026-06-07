import React from 'react';
import type { PilotWeek } from '../../data/pilotDashboardContent';
import PilotStatusPill from './PilotStatusPill';

type PilotWeekCardProps = {
  week: PilotWeek;
};

const STATUS_LABELS: Record<PilotWeek['status'], string> = {
  available: 'Available',
  locked: 'Locked',
  complete: 'Complete',
};

export default function PilotWeekCard({ week }: PilotWeekCardProps) {
  const isLocked = week.status === 'locked';
  const pillTone =
    week.status === 'available' ? 'available' : week.status === 'complete' ? 'complete' : 'locked';

  return (
    <article className={`pilot-dash-weekCard${isLocked ? ' pilot-dash-weekCard--locked' : ''}`}>
      <div className="pilot-dash-weekHead">
        <div>
          <p className="pilot-dash-weekNum">Week {week.week}</p>
          <h3 className="pilot-dash-weekTitle">{week.title}</h3>
          <p className="pilot-dash-weekSel">SEL Focus: {week.selFocus}</p>
        </div>
        <PilotStatusPill status={STATUS_LABELS[week.status]} tone={pillTone} showLock={isLocked} />
      </div>

      {isLocked ? (
        <span className="pilot-dash-cta pilot-dash-cta--disabled pilot-weekCta">{week.kitCta}</span>
      ) : (
        <a href={week.kitHref} className="pilot-dash-cta pilot-weekCta">
          {week.kitCta}
        </a>
      )}
    </article>
  );
}
