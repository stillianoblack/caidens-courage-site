import React, { useMemo } from 'react';
import type { PilotWeek } from '../../data/pilotDashboardContent';
import {
  formatWeekUnlockStatus,
  getUnlockedWeek,
  resolvePilotStartDate,
  resolveWeekStatus,
} from '../../lib/pilotWeekUnlock';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { readActivePortalRole } from '../../config/portalContext';
import { trackWeeklyModuleDownloaded } from '../../lib/analytics';
import PilotStatusPill from './PilotStatusPill';

type PilotWeekCardProps = {
  week: PilotWeek;
};

export default function PilotWeekCard({ week }: PilotWeekCardProps) {
  const activeProgram = readActivePilotProgram();
  const pilotStartDate = resolvePilotStartDate(activeProgram);
  const unlockedWeek = getUnlockedWeek(pilotStartDate);

  const status = useMemo(
    () => resolveWeekStatus(week.week, pilotStartDate),
    [week.week, pilotStartDate],
  );

  const isLocked = status === 'locked';
  const unlockLabel = formatWeekUnlockStatus(week.week, pilotStartDate);
  const pillTone =
    status === 'available' ? 'available' : week.status === 'complete' ? 'complete' : 'locked';
  const pillLabel = isLocked ? unlockLabel : status === 'available' ? 'Available now' : 'Complete';
  const shouldDownloadKit = week.kitHref.startsWith('/downloads/');

  return (
    <article className={`pilot-dash-weekCard${isLocked ? ' pilot-dash-weekCard--locked' : ''}`}>
      <div className="pilot-dash-weekHead">
        <div>
          <p className="pilot-dash-weekNum">Week {week.week}</p>
          <h3 className="pilot-dash-weekTitle">{week.title}</h3>
          <p className="pilot-dash-weekSel">SEL Focus: {week.selFocus}</p>
        </div>
        <PilotStatusPill status={pillLabel} tone={pillTone} showLock={isLocked} />
      </div>

      {isLocked && week.week === unlockedWeek + 1 ? (
        <p className="pilot-dash-weekUnlockHint">{unlockLabel}</p>
      ) : null}

      {isLocked ? (
        <span className="pilot-dash-cta pilot-dash-cta--disabled pilot-weekCta">{week.kitCta}</span>
      ) : (
        <a
          href={week.kitHref}
          download={shouldDownloadKit ? '' : undefined}
          className="pilot-dash-cta pilot-weekCta"
          onClick={() =>
            trackWeeklyModuleDownloaded({
              week: week.week,
              title: week.title,
              role: readActivePortalRole() ?? 'facilitator',
            })
          }
        >
          {week.kitCta}
        </a>
      )}
    </article>
  );
}
