import React, { useState } from 'react';
import {
  GRADE_LEVEL_OPTIONS,
  GRADE_LEVEL_PROMPT,
  isGradeLevel,
  type GradeLevel,
} from '../../data/gradeLevelOptions';
import { saveParticipantGradeLevel } from '../../lib/participantGradeService';

type B4BaselineGradeGateProps = {
  participantId: string;
  submitting?: boolean;
  onComplete: () => void;
};

export default function B4BaselineGradeGate({
  participantId,
  submitting = false,
  onComplete,
}: B4BaselineGradeGateProps) {
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = isGradeLevel(gradeLevel) && !saving && !submitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isGradeLevel(gradeLevel)) return;

    setSaving(true);
    setError(null);

    const result = await saveParticipantGradeLevel(participantId, gradeLevel);
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? 'Could not save grade. Please try again.');
      return;
    }

    onComplete();
  };

  return (
    <form className="bbc-studentForm bbc-gradeGate" onSubmit={(event) => void handleSubmit(event)}>
      <h2 className="bbc-gradeGateTitle">{GRADE_LEVEL_PROMPT}</h2>
      <p className="bbc-fieldHint">This helps B-4 pick activities that fit you.</p>

      <label className="bbc-field">
        <span className="bbc-fieldLabel">Grade</span>
        <select
          className="bbc-fieldInput bbc-fieldSelect"
          value={gradeLevel}
          disabled={saving || submitting}
          required
          onChange={(event) => {
            const next = event.target.value;
            setGradeLevel(isGradeLevel(next) ? next : '');
          }}
        >
          <option value="">Choose your grade…</option>
          {GRADE_LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {error ? (
        <p className="bbc-profileError" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="bbc-primaryBtn bbc-landingCta" disabled={!canContinue}>
        {saving ? 'Saving…' : 'Continue'}
      </button>
    </form>
  );
}
