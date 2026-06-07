import React from 'react';
import './focus-skills-snapshot.css';

const DEFAULT_SKILLS = [
  { label: 'Executive Function', value: 42 },
  { label: 'Self-Regulation', value: 28 },
  { label: 'Focus Recovery', value: 35 },
  { label: 'Overall', value: 35 },
] as const;

type FocusSkillsSnapshotProps = {
  className?: string;
  compact?: boolean;
};

export default function FocusSkillsSnapshot({ className = '', compact = false }: FocusSkillsSnapshotProps) {
  return (
    <section
      className={['focusSkillsSnapshot', compact ? 'focusSkillsSnapshot--compact' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-label="Focus Skills Snapshot"
    >
      <h2 className="focusSkillsSnapshotTitle">Focus Skills Snapshot</h2>
      <p className="focusSkillsSnapshotHelper">
        These are practice areas from completed activities. They will grow as your child plays.
      </p>

      <div className="focusSkillsSnapshotGrid">
        {DEFAULT_SKILLS.map((skill) => (
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
