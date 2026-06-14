import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useFamilyDashboardMetrics } from '../../hooks/useFamilyDashboardMetrics';
import { useActiveChild } from '../../hooks/useActiveChild';
import { resolveTrackingProgramCode } from '../../lib/activeProgramContext';
import { buildFamilyChildJourneySnapshot } from '../../lib/familyChildJourneySnapshot';
import { resolveSelectableFamilyChildren } from '../../lib/familyOnboardingUtils';
import { getPortalRoute } from '../../lib/portalGamePaths';
import FamilyChildJourneyMiniCard from './FamilyChildJourneyMiniCard';
import './family-child-journey-mini-card.css';

type FamilyMultiChildJourneySectionProps = {
  compact?: boolean;
  className?: string;
};

export default function FamilyMultiChildJourneySection({
  compact = false,
  className = '',
}: FamilyMultiChildJourneySectionProps) {
  const location = useLocation();
  const programCode = resolveTrackingProgramCode() ?? '';
  const { children, visibleChildren, studentParticipants, moduleResults, loading } =
    useFamilyDashboardMetrics(programCode);
  const selectableChildren = useMemo(
    () => resolveSelectableFamilyChildren(visibleChildren, children),
    [children, visibleChildren],
  );
  const { activeChild, selectChild } = useActiveChild(selectableChildren);
  const baselinePath = getPortalRoute('baseline-check', location.pathname);

  const snapshots = useMemo(() => {
    const rows = children
      .map((child) =>
        buildFamilyChildJourneySnapshot({
          child,
          programCode,
          studentParticipants,
          moduleResults,
        }),
      )
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    const activeId = activeChild?.participantId;
    return rows.sort((a, b) => {
      if (activeId) {
        if (a.participantId === activeId) return -1;
        if (b.participantId === activeId) return 1;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  }, [activeChild?.participantId, children, moduleResults, programCode, studentParticipants]);

  if (loading) {
    return (
      <div className={`family-missionCoachSkeleton${className ? ` ${className}` : ''}`} aria-busy="true">
        <div className="family-missionCoachSkeletonBar" />
        <div className="family-missionCoachSkeletonBar family-missionCoachSkeletonBar--short" />
      </div>
    );
  }

  if (snapshots.length === 0) return null;

  return (
    <section
      className={`familyMultiChildJourney${compact ? ' familyMultiChildJourney--compact' : ''}${className ? ` ${className}` : ''}`}
      aria-labelledby="family-multi-child-journey-title"
    >
      <div className="family-panelBlockHead">
        <h2 id="family-multi-child-journey-title" className="family-panelBlockTitle">
          Focus Flame Journey
        </h2>
        <p className="family-panelHelper">
          Each child has their own setup path. The active player controls gameplay and rewards.
        </p>
      </div>
      <div className="familyMultiChildJourneyGrid">
        {snapshots.map((snapshot) => (
          <FamilyChildJourneyMiniCard
            key={snapshot.participantId}
            snapshot={snapshot}
            isActivePlayer={snapshot.participantId === activeChild?.participantId}
            onSetActivePlayer={
              snapshot.participantId === activeChild?.participantId
                ? undefined
                : () => {
                    const match = selectableChildren.find(
                      (child) => child.participantId === snapshot.participantId,
                    );
                    if (match) selectChild(match);
                  }
            }
            baselinePath={baselinePath}
          />
        ))}
      </div>
    </section>
  );
}
