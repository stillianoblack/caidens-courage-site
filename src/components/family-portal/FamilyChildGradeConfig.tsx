import React, { useEffect, useId, useState } from 'react';
import {
  GRADE_LEVEL_LABEL,
  GRADE_LEVEL_OPTIONS,
  isGradeLevel,
  normalizeGradeLevelStorage,
  type GradeLevel,
} from '../../data/gradeLevelOptions';
import { FAMILY_GRADE_STRETCH_LABEL } from '../../data/familyGradeBandOptions';
import { hasCanonicalGradeLevel } from '../../lib/participantGradeDisplay';
import { saveParticipantGradeSettings } from '../../lib/participantGradeService';

type FamilyChildGradeConfigProps = {
  participantId: string;
  displayName: string;
  gradeLevel?: string | null;
  allowStretchLevel?: boolean | null;
  highlighted?: boolean;
  onSaved?: () => void;
  showDisplayName?: boolean;
};

export default function FamilyChildGradeConfig({
  participantId,
  displayName,
  gradeLevel,
  allowStretchLevel = false,
  highlighted = false,
  onSaved,
  showDisplayName = true,
}: FamilyChildGradeConfigProps) {
  const selectId = useId();
  const stretchId = useId();
  const [selectedLevel, setSelectedLevel] = useState<GradeLevel | ''>(
    () => normalizeGradeLevelStorage(gradeLevel) ?? '',
  );
  const [stretch, setStretch] = useState(Boolean(allowStretchLevel));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLevel(normalizeGradeLevelStorage(gradeLevel) ?? '');
    setStretch(Boolean(allowStretchLevel));
  }, [allowStretchLevel, gradeLevel, participantId]);

  const persist = async (nextLevel: GradeLevel | '', nextStretch: boolean) => {
    if (!nextLevel) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    const result = await saveParticipantGradeSettings(participantId, {
      grade_level: nextLevel,
      allow_stretch_level: nextStretch,
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error ?? 'Could not save grade level.');
      return;
    }

    setMessage(result.warning ?? 'Grade level saved.');
    onSaved?.();
  };

  const handleLevelChange = (value: string) => {
    if (!isGradeLevel(value)) {
      setSelectedLevel('');
      return;
    }
    setSelectedLevel(value);
    void persist(value, stretch);
  };

  const handleStretchChange = (checked: boolean) => {
    setStretch(checked);
    if (!selectedLevel) return;
    void persist(selectedLevel, checked);
  };

  const missingExactGrade = !hasCanonicalGradeLevel(gradeLevel);

  return (
    <div
      className={[
        'family-childGradeConfig',
        highlighted ? 'family-childGradeConfig--focus' : '',
        missingExactGrade ? 'family-childGradeConfig--missing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-grade-focus={highlighted ? 'true' : undefined}
    >
      {showDisplayName ? <p className="family-childGradeConfigName">{displayName}</p> : null}
      <label className="family-childGradeConfigField" htmlFor={selectId}>
        <span className="family-childGradeConfigLabel">{GRADE_LEVEL_LABEL}</span>
        <select
          id={selectId}
          className="family-childGradeConfigSelect"
          value={selectedLevel}
          disabled={saving}
          onChange={(event) => handleLevelChange(event.target.value)}
        >
          <option value="">Choose a grade…</option>
          {GRADE_LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="family-childGradeConfigStretch" htmlFor={stretchId}>
        <input
          id={stretchId}
          type="checkbox"
          checked={stretch}
          disabled={saving || !selectedLevel}
          onChange={(event) => handleStretchChange(event.target.checked)}
        />
        <span>{FAMILY_GRADE_STRETCH_LABEL}</span>
      </label>

      {saving ? <p className="family-childGradeConfigStatus">Saving…</p> : null}
      {message ? <p className="family-childGradeConfigStatus family-childGradeConfigStatus--ok">{message}</p> : null}
      {error ? <p className="family-childGradeConfigStatus family-childGradeConfigStatus--error">{error}</p> : null}
    </div>
  );
}
