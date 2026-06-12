import React, { useEffect, useState } from 'react';
import {
  GRADE_LEVEL_OPTIONS,
  isGradeLevel,
  normalizeGradeLevelStorage,
  type GradeLevel,
} from '../../data/gradeLevelOptions';
import { getGradeBand } from '../../lib/getGradeBand';
import { saveParticipantGradeLevel } from '../../lib/participantGradeService';

type PilotRosterGradeSelectProps = {
  participantId: string;
  gradeLevel?: string | null;
  onSaved?: (gradeLevel: GradeLevel) => void;
};

export default function PilotRosterGradeSelect({
  participantId,
  gradeLevel,
  onSaved,
}: PilotRosterGradeSelectProps) {
  const [value, setValue] = useState(() => normalizeGradeLevelStorage(gradeLevel) ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(normalizeGradeLevelStorage(gradeLevel) ?? '');
    setSaved(false);
  }, [participantId, gradeLevel]);

  const handleChange = async (next: string) => {
    if (!isGradeLevel(next)) {
      setValue('');
      return;
    }

    setValue(next);
    setSaving(true);
    setSaved(false);

    const result = await saveParticipantGradeLevel(participantId, next);
    setSaving(false);

    if (result.success) {
      setSaved(true);
      onSaved?.(next);
      window.setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="pilot-rosterGradeCell">
      <select
        className="pilot-rosterGradeSelect"
        value={value}
        disabled={saving}
        aria-label="Grade level"
        onChange={(event) => void handleChange(event.target.value)}
      >
        <option value="">Choose grade…</option>
        {GRADE_LEVEL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {saving ? <span className="pilot-rosterGradeStatus">Saving…</span> : null}
      {!saving && saved ? (
        <span className="pilot-rosterGradeStatus pilot-rosterGradeStatus--ok">Saved</span>
      ) : null}
      {!saving && !saved && isGradeLevel(value) ? (
        <span className="pilot-rosterGradeStatus pilot-rosterGradeStatus--hint">
          Adaptive Band: {getGradeBand(value)}
        </span>
      ) : null}
    </div>
  );
}
