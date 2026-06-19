import React from 'react';
import type { CharacterStatField } from './types';
import './character-select.css';

type CharacterStatPanelProps = {
  missionsCompleted: string;
  discoveriesUnlocked: string;
  focusSkills: string[];
  traits: string[];
  nextReward?: string | null;
  extraFields?: CharacterStatField[];
  themeId?: string | null;
};

function StatCard({ label, value }: CharacterStatField) {
  return (
    <div className="kidPlayCharacterStatCard">
      <span className="kidPlayCharacterStatLabel">{label}</span>
      <p className="kidPlayCharacterStatValue">{value}</p>
    </div>
  );
}

export default function CharacterStatPanel({
  missionsCompleted,
  discoveriesUnlocked,
  focusSkills,
  traits,
  nextReward,
  extraFields = [],
  themeId,
}: CharacterStatPanelProps) {
  const focusValue = focusSkills.length > 0 ? focusSkills.join(' · ') : '—';
  const traitsValue = traits.length > 0 ? traits.join(' · ') : '—';

  return (
    <div
      className={[
        'kidPlayCharacterStatPanel',
        themeId ? `kidPlayCharacterStatPanel--${themeId}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-character-stat-panel
    >
      <StatCard label="Missions Completed" value={missionsCompleted} />
      <StatCard label="Discoveries Unlocked" value={discoveriesUnlocked} />
      <StatCard label="Focus Skills" value={focusValue} />
      <StatCard label="Character Traits" value={traitsValue} />
      {nextReward ? <StatCard label="Next Reward" value={nextReward} /> : null}
      {extraFields.map((field) => (
        <StatCard key={field.label} label={field.label} value={field.value} />
      ))}
    </div>
  );
}
