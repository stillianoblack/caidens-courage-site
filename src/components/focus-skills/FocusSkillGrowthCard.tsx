import React from 'react';
import { formatGrowthDelta } from '../../lib/formatGrowthDelta';
import {
  buildSkillB4Insight,
  buildSkillConversationStarter,
  getRelatedMissionsForSkill,
} from '../../lib/familyGrowthInsights';
import type { LocalModuleResultRecord } from '../../lib/pilotTrackingLocalStorage';
import type { FamilyFocusSkillGrowth } from '../../lib/studentGrowthMetrics';

export type FocusSkillGrowthCardProps = {
  skill: FamilyFocusSkillGrowth;
  childName: string;
  moduleResults: LocalModuleResultRecord[];
  participantId?: string | null;
  expanded: boolean;
  hasAnyBaseline: boolean;
  hasAnyCurrent: boolean;
  onToggle: () => void;
};

function formatPct(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value}%`;
}

export default function FocusSkillGrowthCard({
  skill,
  childName,
  moduleResults,
  participantId,
  expanded,
  hasAnyBaseline,
  hasAnyCurrent,
  onToggle,
}: FocusSkillGrowthCardProps) {
  const relatedMissions = getRelatedMissionsForSkill(skill.key, moduleResults, participantId);
  const b4Insight = buildSkillB4Insight(skill, childName);
  const conversationStarter = buildSkillConversationStarter(skill.key);

  const growthDisplay = !hasAnyBaseline
    ? '—'
    : hasAnyCurrent
      ? formatGrowthDelta(skill.growthPct)
      : 'Complete Week 1 or Week 2 to compare';

  return (
    <article className={['focusSkillsSnapshotCard', expanded ? 'focusSkillsSnapshotCard--expanded' : ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        className="focusSkillsSnapshotCardToggle"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span className="focusSkillsSnapshotLabel">{skill.label}</span>
        <span className="focusSkillsSnapshotCardChevron" aria-hidden="true">
          {expanded ? '−' : '+'}
        </span>
      </button>

      <div className="focusSkillsSnapshotMetrics">
        <div className="focusSkillsSnapshotMetric">
          <span className="focusSkillsSnapshotMetricLabel">Baseline</span>
          <span className="focusSkillsSnapshotMetricValue">
            {hasAnyBaseline ? formatPct(skill.baselinePct) : '—'}
          </span>
        </div>
        <div className="focusSkillsSnapshotMetric">
          <span className="focusSkillsSnapshotMetricLabel">Current</span>
          <span className="focusSkillsSnapshotMetricValue">
            {!hasAnyBaseline
              ? '—'
              : hasAnyCurrent
                ? formatPct(skill.currentPct)
                : 'Not enough data yet'}
          </span>
        </div>
        <div className="focusSkillsSnapshotMetric">
          <span className="focusSkillsSnapshotMetricLabel">Growth</span>
          <span className="focusSkillsSnapshotMetricValue focusSkillsSnapshotMetricValue--growth">
            {growthDisplay}
          </span>
        </div>
      </div>

      {expanded ? (
        <div className="focusSkillsSnapshotExpanded">
          <div className="focusSkillsSnapshotExpandedScores">
            <div>
              <span className="focusSkillsSnapshotExpandedLabel">Baseline score</span>
              <strong>{hasAnyBaseline ? formatPct(skill.baselinePct) : '—'}</strong>
            </div>
            <div>
              <span className="focusSkillsSnapshotExpandedLabel">Current score</span>
              <strong>
                {!hasAnyBaseline
                  ? '—'
                  : hasAnyCurrent
                    ? formatPct(skill.currentPct)
                    : 'Not enough data yet'}
              </strong>
            </div>
            <div>
              <span className="focusSkillsSnapshotExpandedLabel">Growth</span>
              <strong className="focusSkillsSnapshotMetricValue--growth">{growthDisplay}</strong>
            </div>
          </div>

          {relatedMissions.length > 0 ? (
            <div className="focusSkillsSnapshotExpandedBlock">
              <h3 className="focusSkillsSnapshotExpandedTitle">Related completed missions</h3>
              <ul className="focusSkillsSnapshotMissionList">
                {relatedMissions.map((mission) => (
                  <li key={mission}>{mission}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="focusSkillsSnapshotExpandedBlock focusSkillsSnapshotInsight">
            <h3 className="focusSkillsSnapshotExpandedTitle">B-4 Insight</h3>
            <p>{b4Insight}</p>
          </div>

          <div className="focusSkillsSnapshotExpandedBlock focusSkillsSnapshotConversation">
            <h3 className="focusSkillsSnapshotExpandedTitle">Parent conversation starter</h3>
            <p>{conversationStarter}</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
