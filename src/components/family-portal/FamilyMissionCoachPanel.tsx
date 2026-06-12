import React from 'react';
import MissionCoachCard from '../../design-system/components/MissionCoachCard';
import { useFamilyOnboardingStatus } from '../../hooks/useFamilyOnboardingStatus';
import '../../design-system/components/mission-coach-card.css';

type FamilyMissionCoachPanelProps = {
  compact?: boolean;
  className?: string;
};

export default function FamilyMissionCoachPanel({
  compact = false,
  className = '',
}: FamilyMissionCoachPanelProps) {
  const { missionCoachProps, loading, isComplete } = useFamilyOnboardingStatus();

  if (loading) {
    return (
      <div className={`family-missionCoachSkeleton${className ? ` ${className}` : ''}`} aria-busy="true">
        <div className="family-missionCoachSkeletonBar" />
        <div className="family-missionCoachSkeletonBar family-missionCoachSkeletonBar--short" />
      </div>
    );
  }

  return (
    <MissionCoachCard
      {...missionCoachProps}
      compact={compact}
      className={className}
      subtitle={isComplete ? 'Your Focus Flame Journey is active' : missionCoachProps.subtitle}
    />
  );
}
