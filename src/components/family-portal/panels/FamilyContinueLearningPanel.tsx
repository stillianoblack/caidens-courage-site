import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ActiveChildSelector from '../ActiveChildSelector';
import WeeklyAdventuresUnlockCard from '../WeeklyAdventuresUnlockCard';
import CourageInTheDarkAdventureHub from '../../courage-in-the-dark/CourageInTheDarkAdventureHub';
import AdventureTrail from '../../../design-system/components/AdventureTrail';
import AdventureTrailLayout from '../../../design-system/components/AdventureTrailLayout';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { useActiveChild } from '../../../hooks/useActiveChild';
import { useBaselineGate } from '../../../hooks/useBaselineGate';
import { useFamilyDashboardMetrics } from '../../../hooks/useFamilyDashboardMetrics';
import { useWeeklyAdventureTrail } from '../../../hooks/useWeeklyAdventureTrail';
import { resolveTrackingProgramCode } from '../../../lib/activeProgramContext';
import { resolveFamilyBasePath } from '../../../lib/familyPortalNav';
import { familyPortalPath } from '../../../lib/familyPortalPaths';
import { getPortalRoute, resolvePortalKidsBasePath } from '../../../lib/portalGamePaths';
import { getUnlockedWeek, resolvePilotStartDate } from '../../../lib/pilotWeekUnlock';
import { PortalPageIntro } from '../../portal-design-system';
import '../weekly-adventures-unlock-card.css';
import '../../courage-in-the-dark/courage-adventure-hub.css';
import '../../courage-in-the-dark/courage-in-the-dark-map.css';

const BASELINE_LOCKED_LABEL = 'Complete B-4 Check-In to unlock';

export default function FamilyContinueLearningPanel() {
  const location = useLocation();
  const activeProgram = readActivePilotProgram();
  const programCode = resolveTrackingProgramCode() ?? undefined;
  const pilotStartDate = resolvePilotStartDate(activeProgram);
  const unlockedWeek = getUnlockedWeek(pilotStartDate);
  const { visibleChildren, claimRequired, loading: childrenLoading } = useFamilyDashboardMetrics(programCode);

  const selectableChildren = useMemo(
    () =>
      visibleChildren
        .map((child) => ({
          participantId: child.studentId,
          displayName: child.displayName,
          firstName: child.displayName,
        }))
        .filter((child) => Boolean(child.participantId)),
    [visibleChildren],
  );

  const { activeChild, hasActiveChild, needsChildSelection, selectChild } =
    useActiveChild(selectableChildren);
  const { complete: baselineComplete, loading: baselineLoading, refresh } = useBaselineGate(
    activeChild?.participantId,
  );

  const basePath = resolveFamilyBasePath(location.pathname);
  const kidsBase = resolvePortalKidsBasePath(location.pathname);
  const downloadsPath = `${basePath}/downloads`;
  const certificatesPath = familyPortalPath('certificates', location.pathname);
  const baselinePath = getPortalRoute('baseline-check', location.pathname);

  const trailPaths = useMemo(
    () => ({
      kidsBasePath: kidsBase,
      downloadsPath,
      certificatesPath,
    }),
    [kidsBase, downloadsPath, certificatesPath],
  );

  const adventuresLocked = !hasActiveChild || !baselineComplete;

  const { weeks: trailWeeks } = useWeeklyAdventureTrail(
    activeChild?.participantId,
    trailPaths,
    { baselineLocked: adventuresLocked },
    pilotStartDate,
  );

  const weekOne = useMemo(() => trailWeeks.find((week) => week.week === 1), [trailWeeks]);
  const trailWeeksAfterHero = useMemo(
    () => trailWeeks.filter((week) => week.week !== 1),
    [trailWeeks],
  );

  const showCourageHero = Boolean(weekOne && weekOne.weekStatus !== 'locked');

  const courageMapNodes = useMemo(
    () =>
      weekOne?.nodes.filter((node) =>
        ['caiden', 'miranda', 'b4', 'charlie', 'zeke'].includes(node.kind),
      ) ?? [],
    [weekOne?.nodes],
  );

  const courageMapSupplementaryNodes = useMemo(
    () =>
      weekOne?.nodes.filter(
        (node) => node.kind === 'family_activity' || node.kind === 'certificate',
      ) ?? [],
    [weekOne?.nodes],
  );

  useEffect(() => {
    void refresh();
  }, [location.pathname, refresh, activeChild?.participantId]);

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    if (!hash.startsWith('week-')) return;
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, trailWeeks.length]);

  const hasChildren = selectableChildren.length > 0;
  const showClaimPrompt = !childrenLoading && claimRequired;
  const showAddChildPrompt = !childrenLoading && !claimRequired && !hasChildren;
  const showUnlockCard =
    hasChildren && hasActiveChild && !baselineLoading && !baselineComplete;
  return (
    <div
      className={['family-panel', showCourageHero ? 'family-panel--courageHub' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {!showCourageHero ? (
        <PortalPageIntro>
          Follow each week&apos;s recommended games, downloads, and family activities after your
          child completes their B-4 Check-In.
        </PortalPageIntro>
      ) : null}

      {showClaimPrompt ? (
        <p className="family-panelHelper family-panelHelper--prominent" role="status">
          Enter Parent/Guardian Email to Find Your Child.
        </p>
      ) : null}

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

      {showCourageHero && weekOne ? (
        <section id="week-1" className="courageMapHubSection" aria-label="Week 1 adventure hub">
          {!hasActiveChild && hasChildren ? (
            <p className="family-panelHelper courageMapProgressWarning" role="status">
              Select a child in the Family Portal to save mission progress.
            </p>
          ) : null}
          <CourageInTheDarkAdventureHub
            weekNodes={courageMapNodes}
            supplementaryNodes={courageMapSupplementaryNodes}
            weekTitle={weekOne.title}
            week={weekOne.week}
            weekUnlockStatus={weekOne.unlockStatus}
            selFocus={weekOne.selFocus}
            baselineLocked={adventuresLocked}
            baselineLockedLabel={
              !hasActiveChild ? 'Select your child to begin' : BASELINE_LOCKED_LABEL
            }
          />
        </section>
      ) : null}

      <AdventureTrailLayout
        className={showCourageHero ? 'adventureTrailLayout--singleColumn' : undefined}
      >
        {showCourageHero && trailWeeksAfterHero.length > 0 ? (
          <h2 className="courageMapHubTrailHeading">More Weekly Adventures</h2>
        ) : null}
        <AdventureTrail
          weeks={showCourageHero ? trailWeeksAfterHero : trailWeeks}
          pilotStartDate={pilotStartDate}
          baselineLocked={adventuresLocked}
          baselineLockedLabel={
            !hasActiveChild ? 'Select your child to begin' : BASELINE_LOCKED_LABEL
          }
        />
      </AdventureTrailLayout>

      {unlockedWeek === 1 ? (
        <p className="family-emptyNote" role="status">
          Week 2 unlocks automatically when your pilot program reaches day 6.
        </p>
      ) : null}
    </div>
  );
}
