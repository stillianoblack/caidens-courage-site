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
};

export default function FocusSkillsSnapshot({
  className = '',
  compact = false,
  skills = EMPTY_SKILLS,
  hasActivity = false,
}: FocusSkillsSnapshotProps) {
  return (
    <section
      className={['focusSkillsSnapshot', compact ? 'focusSkillsSnapshot--compact' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-label="Focus Skills Snapshot"
    >
      <h2 className="focusSkillsSnapshotTitle">Focus Skills Snapshot</h2>
      <p className="focusSkillsSnapshotHelper">
        {hasActivity
          ? 'These are practice areas from completed activities. They will grow as your child plays.'
          : 'Progress will appear here after your family completes activities.'}
      </p>

      <div className="focusSkillsSnapshotGrid">
        {skills.map((skill) => (
          <div key={skill.label} className="focusSkillsSnapshotCard">
            <span className="focusSkillsSnapshotLabel">{skill.label}</span>
            <div className="focusSkillsSnapshotBar" aria-hidden="true">
              <div className="focusSkillsSnapshotFill" style={{ width: `${skill.value}%` }} />
            </div>
            <span className="focusSkillsSnapshotValue">{skill.value}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
