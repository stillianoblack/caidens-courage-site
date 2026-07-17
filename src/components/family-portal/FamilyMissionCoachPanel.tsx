import React from 'react';
import MissionCoachCard from '../../design-system/components/MissionCoachCard';
import { useFamilyOnboardingStatus } from '../../hooks/useFamilyOnboardingStatus';
import FocusFlameProfileReadyCard from './FocusFlameProfileReadyCard';
import B4CircleAvatar from '../b4/B4CircleAvatar';

type FamilyMissionCoachPanelProps = {
  compact?: boolean;
  className?: string;
};

export default function FamilyMissionCoachPanel({
  compact = false,
  className = '',
}: FamilyMissionCoachPanelProps) {
  const {
    loading,
    missionCoachProps,
    isComplete,
    profileReadyChildName,
    profileReadyAvatarSrc,
    adventuresCompletedCount,
    continueLearningPath,
    activeParticipantRecord,
    completedCount,
    totalSteps,
  } = useFamilyOnboardingStatus();

  if (loading) {
    return (
      <div className={`family-missionCoachSkeleton${className ? ` ${className}` : ''}`} aria-busy="true">
        <div className="family-missionCoachSkeletonBar" />
        <div className="family-missionCoachSkeletonBar family-missionCoachSkeletonBar--short" />
      </div>
    );
  }

  const showCelebration =
    Boolean(profileReadyChildName) &&
    (isComplete || (totalSteps > 0 && completedCount >= totalSteps));

  if (showCelebration && profileReadyChildName) {
    return (
      <FocusFlameProfileReadyCard
        childName={profileReadyChildName}
        avatarSrc={profileReadyAvatarSrc}
        participant={activeParticipantRecord}
        adventuresCompletedCount={adventuresCompletedCount}
        continueLearningPath={continueLearningPath}
        variant={compact ? 'compact' : 'inline'}
        className={className}
      />
    );
  }

  return (
    <MissionCoachCard
      {...missionCoachProps}
      compact={compact}
      className={className}
      avatarContent={
        <B4CircleAvatar
          variant={activeParticipantRecord?.b4_variant_key}
          size="medium"
          alt=""
          className="ds-missionCoach-b4Avatar"
        />
      }
    />
  );
}
