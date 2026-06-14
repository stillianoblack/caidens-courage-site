import React, { useMemo } from 'react';
import { useFamilyDashboardMetrics } from '../../hooks/useFamilyDashboardMetrics';
import { useActiveChild } from '../../hooks/useActiveChild';
import { resolveTrackingProgramCode } from '../../lib/activeProgramContext';
import { readFamilyChildGoalsLocal, hasFamilyChildGoals } from '../../lib/familyChildGoalsService';
import { resolveSelectableFamilyChildren } from '../../lib/familyOnboardingUtils';
import {
  formatFamilyRelativeActivityDate,
  resolveChildDisplayInitials,
  resolveChildModuleCounts,
  resolveFamilyChildAvatarSrc,
} from '../../lib/familyChildSummaryCard';
import FamilyChildSummaryCard from './FamilyChildSummaryCard';
import './family-children-dashboard-grid.css';

type FamilyChildrenDashboardGridProps = {
  programName: string;
  loading?: boolean;
  onViewProgress?: (participantId: string) => void;
  className?: string;
};

export default function FamilyChildrenDashboardGrid({
  programName,
  loading = false,
  onViewProgress,
  className = '',
}: FamilyChildrenDashboardGridProps) {
  const programCode = resolveTrackingProgramCode() ?? '';
  const { children, visibleChildren, studentParticipants, moduleResults } =
    useFamilyDashboardMetrics(programCode);
  const selectableChildren = useMemo(
    () => resolveSelectableFamilyChildren(visibleChildren, children),
    [children, visibleChildren],
  );
  const { activeChild, selectChild } = useActiveChild(selectableChildren);

  const cards = useMemo(
    () =>
      children
        .filter((child) => child.participantId)
        .map((child) => {
          const participantId = child.participantId as string;
          const participant = studentParticipants.find((row) => row.id === participantId);
          const goalsRecord = readFamilyChildGoalsLocal(programCode, participantId);
          const moduleCounts = resolveChildModuleCounts(participantId, moduleResults);
          return {
            participantId,
            childName: child.displayName,
            baselineStatus: child.baselineStatus,
            b4CheckInStatus: child.b4CheckInStatus,
            familyGoalsSet: hasFamilyChildGoals(goalsRecord),
            modulesCompleted: moduleCounts.completed,
            modulesTotal: moduleCounts.total,
            progressPct: child.progressPct,
            lastActivityLabel: formatFamilyRelativeActivityDate(child.lastActivityAt),
            gradeLevel: participant?.grade_level ?? null,
            gradeBand: participant?.grade_band ?? null,
            avatarSrc: resolveFamilyChildAvatarSrc({ participantId, moduleResults }),
            avatarInitials: resolveChildDisplayInitials(child.displayName),
          };
        }),
    [children, moduleResults, programCode, studentParticipants],
  );

  if (loading) {
    return (
      <div className={`familyChildrenDashboardGrid familyChildrenDashboardGrid--loading${className ? ` ${className}` : ''}`}>
        <div className="family-skeletonBar" />
        <div className="family-skeletonBar" />
      </div>
    );
  }

  if (cards.length === 0) return null;

  return (
    <section className={`familyChildrenDashboardGrid${className ? ` ${className}` : ''}`} aria-label="Family children">
      {cards.map((card) => {
        const isActive = card.participantId === activeChild?.participantId;
        return (
          <FamilyChildSummaryCard
            key={card.participantId}
            childName={card.childName}
            programName={programName}
            baselineStatus={card.baselineStatus}
            b4CheckInStatus={card.b4CheckInStatus}
            modulesCompleted={card.modulesCompleted}
            modulesTotal={card.modulesTotal}
            lastActivityLabel={card.lastActivityLabel}
            gradeLevel={card.gradeLevel}
            gradeBand={card.gradeBand}
            avatarSrc={card.avatarSrc}
            avatarInitials={card.avatarInitials}
            activeParticipantId={activeChild?.participantId}
            isActivePlayer={isActive}
            onSetActivePlayer={
              isActive
                ? undefined
                : () => {
                    const match = selectableChildren.find(
                      (row) => row.participantId === card.participantId,
                    );
                    if (match) selectChild(match);
                  }
            }
            familyGoalsSet={card.familyGoalsSet}
            onViewProgress={() => onViewProgress?.(card.participantId)}
            className={isActive ? 'family-childSummaryCard--activePlayer' : undefined}
          />
        );
      })}
    </section>
  );
}
