import React, { useEffect, useState } from 'react';
import {
  FAMILY_CHILD_CHALLENGE_OPTIONS,
  FAMILY_CHILD_GOALS_COPY,
  FAMILY_CHILD_STRENGTH_OPTIONS,
} from '../../data/familyChildGoalsOptions';
import type { FamilyChildGoalsRecord } from '../../lib/familyChildGoalsService';
import { saveFamilyChildGoals } from '../../lib/familyChildGoalsService';

type FamilyChildGoalsChecklistProps = {
  programCode: string;
  childId?: string | null;
  childName?: string | null;
  initialRecord?: FamilyChildGoalsRecord | null;
  compact?: boolean;
  title?: string;
  subtitle?: string;
  strengthsTitle?: string;
  strengthsSubtitle?: string;
  onSaved?: (record: FamilyChildGoalsRecord) => void;
};

export default function FamilyChildGoalsChecklist({
  programCode,
  childId,
  childName,
  initialRecord,
  compact = false,
  title = FAMILY_CHILD_GOALS_COPY.title,
  subtitle = FAMILY_CHILD_GOALS_COPY.subtitle,
  strengthsTitle = FAMILY_CHILD_GOALS_COPY.strengthsTitle,
  strengthsSubtitle = FAMILY_CHILD_GOALS_COPY.strengthsSubtitle,
  onSaved,
}: FamilyChildGoalsChecklistProps) {
  const [goals, setGoals] = useState<string[]>(initialRecord?.goals ?? []);
  const [strengths, setStrengths] = useState<string[]>(initialRecord?.strengths ?? []);
  const [goalLimitHint, setGoalLimitHint] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    setGoals(initialRecord?.goals ?? []);
    setStrengths(initialRecord?.strengths ?? []);
  }, [initialRecord?.goals, initialRecord?.strengths, childId]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) => {
      if (prev.includes(goal)) {
        setGoalLimitHint(false);
        return prev.filter((item) => item !== goal);
      }
      if (prev.length >= FAMILY_CHILD_GOALS_COPY.maxGoals) {
        setGoalLimitHint(true);
        return prev;
      }
      setGoalLimitHint(false);
      return [...prev, goal];
    });
  };

  const toggleStrength = (strength: string) => {
    setStrengths((prev) => {
      if (prev.includes(strength)) {
        return prev.filter((item) => item !== strength);
      }
      if (prev.length >= FAMILY_CHILD_GOALS_COPY.maxStrengths) {
        return prev;
      }
      return [...prev, strength];
    });
  };

  const canSave =
    goals.length > 0 &&
    strengths.length >= FAMILY_CHILD_GOALS_COPY.minStrengths &&
    !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setMessage(null);
    setWarning(null);
    const result = await saveFamilyChildGoals({
      family_program_code: programCode,
      child_id: childId ?? null,
      child_name: childName ?? null,
      goals,
      strengths,
    });
    setSaving(false);
    if (result.warning) setWarning(result.warning);
    setMessage('Thanks! B-4 saved your Parent/Guardian goals.');
    onSaved?.(result.record);
  };

  return (
    <section
      className={`family-childGoals${compact ? ' family-childGoals--compact' : ''}`}
      aria-labelledby="family-child-goals-title"
    >
      <div className="family-childGoalsHead">
        <h2 id="family-child-goals-title" className="family-childGoalsTitle">
          {title}
        </h2>
        <p className="family-childGoalsSubtitle">{subtitle}</p>
        <p className="family-childGoalsLimit">
          Parent/Guardian can choose up to {FAMILY_CHILD_GOALS_COPY.maxGoals} (
          {goals.length}/{FAMILY_CHILD_GOALS_COPY.maxGoals} selected)
        </p>
        {goalLimitHint ? (
          <p className="family-childGoalsHint" role="alert">
            Choose up to {FAMILY_CHILD_GOALS_COPY.maxGoals} focus areas.
          </p>
        ) : null}
      </div>

      <div className="family-childGoalsGrid" role="group" aria-label="Focus areas">
        {FAMILY_CHILD_CHALLENGE_OPTIONS.map((goal) => {
          const selected = goals.includes(goal);
          return (
            <label
              key={goal}
              className={`family-childGoalsOption${selected ? ' family-childGoalsOption--selected' : ''}`}
            >
              <input type="checkbox" checked={selected} onChange={() => toggleGoal(goal)} />
              <span>{goal}</span>
            </label>
          );
        })}
      </div>

      <div className="family-childGoalsStrengths">
        <h3 className="family-childGoalsStrengthsTitle">{strengthsTitle}</h3>
        <p className="family-childGoalsStrengthsSubtitle">{strengthsSubtitle}</p>
        <div className="family-childGoalsGrid" role="group" aria-label="Child strengths">
          {FAMILY_CHILD_STRENGTH_OPTIONS.map((strength) => {
            const selected = strengths.includes(strength);
            return (
              <label
                key={strength}
                className={`family-childGoalsOption${selected ? ' family-childGoalsOption--selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleStrength(strength)}
                />
                <span>{strength}</span>
              </label>
            );
          })}
        </div>
      </div>

      {message ? (
        <p className="family-childGoalsMessage family-childGoalsMessage--success" role="status">
          {message}
        </p>
      ) : null}
      {warning ? (
        <p className="family-childGoalsMessage family-childGoalsMessage--warn" role="status">
          {warning}
        </p>
      ) : null}

      <button
        type="button"
        className="family-childGoalsSave"
        disabled={!canSave}
        onClick={() => void handleSave()}
      >
        {saving ? 'Saving…' : 'Save Parent/Guardian Goals'}
      </button>
    </section>
  );
}
