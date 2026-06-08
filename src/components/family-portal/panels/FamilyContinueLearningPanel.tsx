import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import WeeklyAdventureWeekCard from '../WeeklyAdventureWeekCard';
import WeeklyAdventuresUnlockCard from '../WeeklyAdventuresUnlockCard';
import {
  FAMILY_WEEKLY_ADVENTURE_WEEKS,
  buildWeek1Activities,
} from '../../../data/familyWeeklyAdventures';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { useBaselineGate } from '../../../hooks/useBaselineGate';
import { resolveFamilyBasePath } from '../../../lib/familyPortalNav';
import { getPortalRoute, resolvePortalKidsBasePath } from '../../../lib/portalGamePaths';
import {
  formatWeekUnlockStatus,
  getUnlockedWeek,
  resolvePilotStartDate,
  resolveWeekStatus,
} from '../../../lib/pilotWeekUnlock';
import '../weekly-adventure-week-card.css';
import '../weekly-adventures-unlock-card.css';

const BASELINE_LOCKED_LABEL = 'Complete B-4 Check-In to unlock';

export default function FamilyContinueLearningPanel() {
  const location = useLocation();
  const activeProgram = readActivePilotProgram();
  const pilotStartDate = resolvePilotStartDate(activeProgram);
  const unlockedWeek = getUnlockedWeek(pilotStartDate);
  const { complete: baselineComplete, loading: baselineLoading, refresh } = useBaselineGate();
  const basePath = resolveFamilyBasePath(location.pathname);
  const kidsBase = resolvePortalKidsBasePath(location.pathname);
  const downloadsPath = `${basePath}/downloads`;
  const baselinePath = getPortalRoute('baseline-check', location.pathname);

  const week1Activities = useMemo(
    () => buildWeek1Activities(kidsBase, downloadsPath),
    [kidsBase, downloadsPath],
  );

  useEffect(() => {
    void refresh();
  }, [location.pathname, refresh]);

  const showUnlockCard = !baselineLoading && !baselineComplete;

  return (
    <div className="family-panel">
      <div className="family-panelIntro">
        <h2 className="family-panelIntroTitle">Your guided weekly path</h2>
        <p className="family-panelIntroSubtitle">
          Follow each week&apos;s recommended games, downloads, and family activities. Character Hub
          stays open for free exploration anytime.
        </p>
      </div>

      {showUnlockCard ? <WeeklyAdventuresUnlockCard baselinePath={baselinePath} /> : null}

      <div className="weeklyAdventureWeekStack">
        {FAMILY_WEEKLY_ADVENTURE_WEEKS.map((week) => {
          const status = resolveWeekStatus(week.week, pilotStartDate);
          const unlockStatus = formatWeekUnlockStatus(week.week, pilotStartDate);
          const week1BaselineLocked = week.week === 1 && !baselineComplete;

          return (
            <WeeklyAdventureWeekCard
              key={week.week}
              weekNumber={week.week}
              title={week.title}
              selFocus={week.selFocus}
              status={status}
              unlockStatus={unlockStatus}
              activities={
                week.week === 1 && status === 'available' ? week1Activities : undefined
              }
              previewActivities={week.previewActivities}
              pilotStartDate={pilotStartDate}
              baselineLocked={week1BaselineLocked}
              baselineLockedLabel={BASELINE_LOCKED_LABEL}
            />
          );
        })}
      </div>

      {unlockedWeek === 1 ? (
        <p className="family-emptyNote" role="status">
          Week 2 unlocks automatically when your pilot program reaches day 6.
        </p>
      ) : null}
    </div>
  );
}
