import React from 'react';
import type { FamilyFocusSkill } from '../../lib/familyProgressMetrics';
import './focus-skills-snapshot.css';

const EMPTY_SKILLS: FamilyFocusSkill[] = [
  { label: 'Executive Function', value: 0 },
  { label: 'Self-Regulation', value: 0 },
  { label: 'Focus Recovery', value: 0 },
  { label: 'Overall', value: 0 },
];

type FocusSkillsSnapshotProps = {
  className?: string;
  compact?: boolean;
  skills?: FamilyFocusSkill[];
  hasActivity?: boolean;
  hasChildActivity?: boolean;
  adultBaselineComplete?: boolean;
};

export default function FocusSkillsSnapshot({
  className = '',
  compact = false,
  skills = EMPTY_SKILLS,
  hasActivity = false,
  hasChildActivity = false,
  adultBaselineComplete = false,
}: FocusSkillsSnapshotProps) {
  const helperText = (() => {
    if (!hasActivity) {
      return 'Progress will appear here after your family completes activities.';
    }
    if (!hasChildActivity && adultBaselineComplete) {
      return 'Parent learning scores are shown below. Child skill bars will grow after your child completes missions.';
    }
    return 'These practice areas combine parent and child activity from your active family program.';
  })();

  return (
    <section
      className={['focusSkillsSnapshot', compact ? 'focusSkillsSnapshot--compact' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-label="Focus Skills Snapshot"
    >
      <h2 className="focusSkillsSnapshotTitle">Focus Skills Snapshot</h2>
      <p className="focusSkillsSnapshotHelper">{helperText}</p>

      <div className="focusSkillsSnapshotGrid">
        {skills.map((skill) => (
          <div key={skill.label} className="focusSkillsSnapshotCard">
            <span className="focusSkillsSnapshotLabel">{skill.label}</span>
            <div className="focusSkillsSnapshotBar" aria-hidden="true">
              <div className="focusSkillsSnapshotFill" style={{ width: `${skill.value}%` }} />
            </div>
            <span className="focusSkillsSnapshotValue">{hasActivity ? `${skill.value}%` : '0%'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
