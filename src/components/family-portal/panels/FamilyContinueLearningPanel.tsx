import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ActiveChildSelector from '../ActiveChildSelector';
import WeeklyAdventuresUnlockCard from '../WeeklyAdventuresUnlockCard';
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
    <div className="family-panel">
      <PortalPageIntro>
        Follow each week&apos;s recommended games, downloads, and family activities after your
        child completes their B-4 Check-In.
      </PortalPageIntro>

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

      <AdventureTrailLayout>
        <AdventureTrail
          weeks={trailWeeks}
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
