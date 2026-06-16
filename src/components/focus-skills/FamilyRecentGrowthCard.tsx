import React from 'react';
import { Link } from 'react-router-dom';
import { formatGrowthDelta } from '../../lib/formatGrowthDelta';
import type { FamilyRecentGrowthSummary } from '../../lib/familyGrowthInsights';

export type FamilyRecentGrowthCardProps = {
  summary: FamilyRecentGrowthSummary;
  fromPath?: string;
  className?: string;
};

export default function FamilyRecentGrowthCard({
  summary,
  fromPath,
  className = '',
}: FamilyRecentGrowthCardProps) {
  return (
    <section
      className={['focusSkillsRecentGrowth', className].filter(Boolean).join(' ')}
      aria-label="Recent Growth"
    >
      <h3 className="focusSkillsRecentGrowthTitle">Recent Growth</h3>
      <div className="focusSkillsRecentGrowthGrid">
        <div className="focusSkillsRecentGrowthItem">
          <span className="focusSkillsRecentGrowthLabel">Strongest growth area</span>
          <strong className="focusSkillsRecentGrowthValue">
            {summary.strongestArea
              ? `${summary.strongestArea}${summary.strongestDelta != null ? ` (${formatGrowthDelta(summary.strongestDelta)})` : ''}`
              : 'Complete weekly missions to see growth'}
          </strong>
        </div>
        <div className="focusSkillsRecentGrowthItem">
          <span className="focusSkillsRecentGrowthLabel">Newest completed mission</span>
          <strong className="focusSkillsRecentGrowthValue">
            {summary.newestCompletion ?? 'No missions completed yet'}
          </strong>
        </div>
        <div className="focusSkillsRecentGrowthItem">
          <span className="focusSkillsRecentGrowthLabel">Latest certificate or badge</span>
          <strong className="focusSkillsRecentGrowthValue">
            {summary.latestCertificate ?? 'Keep going — certificates unlock with strong mission scores'}
          </strong>
        </div>
        <div className="focusSkillsRecentGrowthItem focusSkillsRecentGrowthItem--recommended">
          <span className="focusSkillsRecentGrowthLabel">Recommended next activity</span>
          <strong className="focusSkillsRecentGrowthValue">{summary.recommendedHeadline}</strong>
          <p className="focusSkillsRecentGrowthCopy">{summary.recommendedBody}</p>
          <Link
            to={summary.recommendedHref}
            state={fromPath ? { from: fromPath } : undefined}
            className="focusSkillsRecentGrowthCta"
          >
            {summary.recommendedCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
