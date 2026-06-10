import React from 'react';
import LearningMomentCard from './LearningMomentCard';

export type ExpertInsightCardProps = {
  characterId?: string;
  insight: string;
  whyItMatters?: string;
  tryThis?: string[];
  tryThisLabel?: string;
  watchFor?: string;
  className?: string;
};

/** @deprecated Prefer LearningMomentCard with variant="FACILITATOR_INSIGHT" */
export default function ExpertInsightCard({
  insight,
  whyItMatters,
  tryThis = [],
  tryThisLabel,
  watchFor,
  className = '',
}: ExpertInsightCardProps) {
  return (
    <LearningMomentCard
      variant="FACILITATOR_INSIGHT"
      headline={insight}
      whyItMatters={whyItMatters}
      tryThis={tryThis}
      tryThisLabel={tryThisLabel}
      watchFor={watchFor}
      className={className}
    />
  );
}
