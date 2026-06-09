import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ActiveChildSelector from '../ActiveChildSelector';
import WeeklyAdventureWeekCard from '../WeeklyAdventureWeekCard';
import WeeklyAdventuresUnlockCard from '../WeeklyAdventuresUnlockCard';
import {
  FAMILY_WEEKLY_ADVENTURE_WEEKS,
  buildWeek1Activities,
} from '../../../data/familyWeeklyAdventures';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useBaselineGate } from '../../../hooks/useBaselineGate';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
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
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const pilotStartDate = resolvePilotStartDate(activeProgram);
  const unlockedWeek = getUnlockedWeek(pilotStartDate);
  const { children, visibleChildren, loading: childrenLoading } = useFamilyDashboardMetrics(programCode);

  const selectableChildren = useMemo(
    () =>
      (visibleChildren.length > 0
        ? visibleChildren.map((child) => ({
            participantId: child.studentId,
            displayName: child.displayName,
            firstName: child.displayName,
          }))
        : children.map((child) => ({
            participantId: child.participantId ?? '',
            displayName: child.displayName,
            firstName: child.displayName,
          }))
      ).filter((child) => Boolean(child.participantId)),
    [children, visibleChildren],
  );

  const { activeChild, hasActiveChild, needsChildSelection, selectChild } =
    useActiveChild(selectableChildren);
  const { complete: baselineComplete, loading: baselineLoading, refresh } = useBaselineGate(
    activeChild?.participantId,
  );

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
  }, [location.pathname, refresh, activeChild?.participantId]);

  const hasChildren = selectableChildren.length > 0;
  const showAddChildPrompt = !childrenLoading && !hasChildren;
  const showUnlockCard =
    hasChildren && hasActiveChild && !baselineLoading && !baselineComplete;
  const adventuresLocked = !hasActiveChild || !baselineComplete;

  return (
    <div className="family-panel">
      <div className="family-panelIntro">
        <h2 className="family-panelIntroTitle">Your guided weekly path</h2>
        <p className="family-panelIntroSubtitle">
          Follow each week&apos;s recommended games, downloads, and family activities after your
          child completes B-4 Check-In.
        </p>
      </div>

      {showAddChildPrompt ? (
        <p className="family-panelHelper family-panelHelper--prominent" role="status">
          Add your child to begin.
        </p>
      ) : null}

      {needsChildSelection ? (
        <ActiveChildSelector
          children={selectableChildren}
          activeParticipantId={activeChild?.participantId}
          onSelect={selectChild}
        />
      ) : null}

      {showUnlockCard ? <WeeklyAdventuresUnlockCard baselinePath={baselinePath} /> : null}

      <div className="weeklyAdventureWeekStack">
        {FAMILY_WEEKLY_ADVENTURE_WEEKS.map((week) => {
          const status = resolveWeekStatus(week.week, pilotStartDate);
          const unlockStatus = formatWeekUnlockStatus(week.week, pilotStartDate);
          const weekBaselineLocked = adventuresLocked;

          return (
            <WeeklyAdventureWeekCard
              key={week.week}
              weekNumber={week.week}
              title={week.title}
              selFocus={week.selFocus}
              status={status}
              unlockStatus={unlockStatus}
              activities={
                week.week === 1 && status === 'available' && !weekBaselineLocked
                  ? week1Activities
                  : undefined
              }
              previewActivities={week.previewActivities}
              pilotStartDate={pilotStartDate}
              baselineLocked={weekBaselineLocked}
              baselineLockedLabel={
                !hasActiveChild ? 'Select your child to begin' : BASELINE_LOCKED_LABEL
              }
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
