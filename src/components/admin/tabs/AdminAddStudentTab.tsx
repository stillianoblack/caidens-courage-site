import React, { useMemo, useState } from 'react';
import {
  GRADE_LEVEL_LABEL,
  GRADE_LEVEL_OPTIONS,
  isGradeLevel,
  type GradeLevel,
} from '../../../data/gradeLevelOptions';
import { createAdminEmergencyStudent } from '../../../lib/adminEmergencyAddStudentService';
import type { PilotProgramRecord } from '../../../types/pilotProgram';
import SettingsCard from '../../family-portal/settings/SettingsCard';

type AdminAddStudentTabProps = {
  programs: PilotProgramRecord[];
  onCopied: (message: string) => void;
};

export default function AdminAddStudentTab({ programs, onCopied }: AdminAddStudentTabProps) {
  const activePrograms = useMemo(
    () => programs.filter((program) => program.pilot_status !== 'archived'),
    [programs],
  );

  const [childFirstName, setChildFirstName] = useState('');
  const [childNickname, setChildNickname] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | ''>('');
  const [parentEmail, setParentEmail] = useState('');
  const [campProgramCode, setCampProgramCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    childFirstName.trim().length > 0 &&
    isGradeLevel(gradeLevel) &&
    campProgramCode.trim().length > 0 &&
    !submitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!canSubmit || !isGradeLevel(gradeLevel)) {
      setError('Child name, grade level, and program are required.');
      return;
    }

    setSubmitting(true);
    const result = await createAdminEmergencyStudent({
      childFirstName: childFirstName.trim(),
      childNickname: childNickname.trim() || undefined,
      gradeLevel,
      parentEmail: parentEmail.trim() || undefined,
      campProgramCode: campProgramCode.trim(),
      groupName: groupName.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(result.message);
    if (result.familyAccessCode) {
      onCopied(`Family access code copied: ${result.familyAccessCode}`);
      try {
        await navigator.clipboard.writeText(result.familyAccessCode);
      } catch {
        /* clipboard unavailable */
      }
    }

    setChildFirstName('');
    setChildNickname('');
    setGradeLevel('');
    setParentEmail('');
    setGroupName('');
    setNotes('');
  };

  return (
    <SettingsCard
      title="Emergency Add Student"
      subtitle="Manually create a camp participant when facilitator onboarding is blocked. Parent can claim the child later with the program family access code."
    >
      <form className="adminPortal-form" onSubmit={(event) => void handleSubmit(event)}>
        <label className="adminPortal-field">
          <span>Child first name</span>
          <input
            value={childFirstName}
            onChange={(event) => setChildFirstName(event.target.value)}
            required
          />
        </label>

        <label className="adminPortal-field">
          <span>Child nickname (optional)</span>
          <input
            value={childNickname}
            onChange={(event) => setChildNickname(event.target.value)}
          />
        </label>

        <label className="adminPortal-field">
          <span>{GRADE_LEVEL_LABEL}</span>
          <select
            value={gradeLevel}
            onChange={(event) => {
              const next = event.target.value;
              setGradeLevel(isGradeLevel(next) ? next : '');
            }}
            required
          >
            <option value="">Choose grade…</option>
            {GRADE_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="adminPortal-field">
          <span>Parent email (optional)</span>
          <input
            type="email"
            value={parentEmail}
            onChange={(event) => setParentEmail(event.target.value)}
            placeholder="parent@example.com"
          />
        </label>

        <label className="adminPortal-field">
          <span>Program / camp</span>
          <select
            value={campProgramCode}
            onChange={(event) => setCampProgramCode(event.target.value)}
            required
          >
            <option value="">Select program…</option>
            {activePrograms.map((program) => (
              <option key={program.program_code} value={program.program_code}>
                {program.program_name} ({program.program_code})
              </option>
            ))}
          </select>
        </label>

        <label className="adminPortal-field">
          <span>Group (optional)</span>
          <input value={groupName} onChange={(event) => setGroupName(event.target.value)} />
        </label>

        <label className="adminPortal-field">
          <span>Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Why this student was added manually…"
          />
        </label>

        {error ? <p className="adminPortal-error">{error}</p> : null}
        {message ? <p className="adminPortal-actionSuccess">{message}</p> : null}

        <div className="adminPortal-actions">
          <button
            type="submit"
            className="adminPortal-btn adminPortal-btn--primary"
            disabled={!canSubmit}
          >
            {submitting ? 'Adding…' : 'Add Student'}
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}
