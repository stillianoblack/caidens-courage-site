import React, { useState } from 'react';
import InfoTooltip from '../ui/InfoTooltip';
import {
  buildFamilyRecentGrowthSummary,
  FAMILY_GROWTH_SECTION_TOOLTIP,
} from '../../lib/familyGrowthInsights';
import type { FamilyRecommendedNext } from '../../lib/familyOverviewRecommendations';
import type { FamilyRecentActivityItem } from '../../lib/familyProgressMetrics';
import type { LocalModuleResultRecord } from '../../lib/pilotTrackingLocalStorage';
import type { FamilyFocusSkillGrowth } from '../../lib/studentGrowthMetrics';
import FamilyRecentGrowthCard from './FamilyRecentGrowthCard';
import FocusSkillGrowthCard from './FocusSkillGrowthCard';
import './focus-skills-snapshot.css';

const EMPTY_SKILLS: FamilyFocusSkillGrowth[] = [
  { key: 'executive', label: 'Executive Function', baselinePct: null, currentPct: null, growthPct: null },
  { key: 'selfRegulation', label: 'Self-Regulation', baselinePct: null, currentPct: null, growthPct: null },
  { key: 'focusRecovery', label: 'Focus Recovery', baselinePct: null, currentPct: null, growthPct: null },
  { key: 'overall', label: 'Overall', baselinePct: null, currentPct: null, growthPct: null },
];

type FocusSkillsSnapshotProps = {
  className?: string;
  compact?: boolean;
  skills?: FamilyFocusSkillGrowth[];
  hasActivity?: boolean;
  hasChildActivity?: boolean;
  adultBaselineComplete?: boolean;
  childName?: string;
  participantId?: string | null;
  moduleResults?: LocalModuleResultRecord[];
  recentActivity?: FamilyRecentActivityItem[];
  recommendedNext?: FamilyRecommendedNext;
  fromPath?: string;
};

export default function FocusSkillsSnapshot({
  className = '',
  compact = false,
  skills = EMPTY_SKILLS,
  hasActivity = false,
  hasChildActivity = false,
  adultBaselineComplete = false,
  childName = 'your child',
  participantId = null,
  moduleResults = [],
  recentActivity = [],
  recommendedNext,
  fromPath,
}: FocusSkillsSnapshotProps) {
  const [expandedSkillKey, setExpandedSkillKey] = useState<string | null>(null);
  const hasAnyBaseline = skills.some((skill) => skill.baselinePct != null);
  const hasAnyCurrent = skills.some((skill) => skill.currentPct != null);

  const helperText = (() => {
    if (!hasAnyBaseline) {
      return 'Complete B-4 Baseline Check to start measuring growth.';
    }
    if (!hasAnyCurrent) {
      return 'Baseline recorded. Complete Week 1 or Week 2 adventures to compare current progress.';
    }
    if (!hasActivity) {
      return 'Progress will appear here after your family completes activities.';
    }
    if (!hasChildActivity && adultBaselineComplete) {
      return 'Parent learning is recorded separately. Child growth uses canonical baseline and weekly mission scores.';
    }
    return 'Scores use the earliest valid B-4 baseline and the first valid weekly mission completion (replay and challenge retakes are excluded).';
  })();

  const recentGrowthSummary =
    recommendedNext &&
    buildFamilyRecentGrowthSummary({
      skills,
      moduleResults,
      participantId,
      recentActivity,
      recommendation: recommendedNext,
    });

  return (
    <section
      className={['focusSkillsSnapshot', compact ? 'focusSkillsSnapshot--compact' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-label="Focus Skills Snapshot"
    >
      <div className="focusSkillsSnapshotHeader">
        <h2 className="focusSkillsSnapshotTitle">Focus Skills Snapshot</h2>
        <InfoTooltip label={FAMILY_GROWTH_SECTION_TOOLTIP} alignEnd />
      </div>
      <p className="focusSkillsSnapshotHelper">{helperText}</p>

      <div className="focusSkillsSnapshotGrid">
        {skills.map((skill) => (
          <FocusSkillGrowthCard
            key={skill.key}
            skill={skill}
            childName={childName}
            moduleResults={moduleResults}
            participantId={participantId}
            expanded={expandedSkillKey === skill.key}
            hasAnyBaseline={hasAnyBaseline}
            hasAnyCurrent={hasAnyCurrent}
            onToggle={() =>
              setExpandedSkillKey((current) => (current === skill.key ? null : skill.key))
            }
          />
        ))}
      </div>

      {recentGrowthSummary && !compact ? (
        <FamilyRecentGrowthCard summary={recentGrowthSummary} fromPath={fromPath} />
      ) : null}
    </section>
  );
}
