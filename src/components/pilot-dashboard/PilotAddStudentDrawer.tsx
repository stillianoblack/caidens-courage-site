import React, { useState } from 'react';
import { createCampChildWithParentLink } from '../../lib/campChildOnboardingService';
import {
  GRADE_LEVEL_ENCOURAGE,
  GRADE_LEVEL_LABEL,
  GRADE_LEVEL_OPTIONS,
  isGradeLevel,
  type GradeLevel,
} from '../../data/gradeLevelOptions';
import PilotDrawer from './PilotDrawer';

type PilotAddStudentDrawerProps = {
  open: boolean;
  onClose: () => void;
  programCode: string;
  onSuccess: (message: string) => void;
};

export default function PilotAddStudentDrawer({
  open,
  onClose,
  programCode,
  onSuccess,
}: PilotAddStudentDrawerProps) {
  const [childFirstName, setChildFirstName] = useState('');
  const [childNickname, setChildNickname] = useState('');
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    childFirstName.trim().length > 0 &&
    parentLastName.trim().length > 0 &&
    parentEmail.trim().length > 0 &&
    programCode.trim().length > 0 &&
    !submitting;

  const resetForm = () => {
    setChildFirstName('');
    setChildNickname('');
    setParentFirstName('');
    setParentLastName('');
    setParentEmail('');
    setParentPhone('');
    setGradeLevel('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const result = await createCampChildWithParentLink({
      childFirstName: childFirstName.trim(),
      childNickname: childNickname.trim() || undefined,
      parentFirstName: parentFirstName.trim(),
      parentLastName: parentLastName.trim(),
      parentEmail: parentEmail.trim(),
      parentPhone: parentPhone.trim() || undefined,
      gradeLevel: isGradeLevel(gradeLevel) ? gradeLevel : undefined,
      campProgramCode: programCode.trim(),
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    resetForm();
    onSuccess(result.message);
    onClose();
  };

  return (
    <PilotDrawer
      open={open}
      onClose={handleClose}
      className="pilot-drawer pilot-drawer--form"
      titleId="pilot-add-student-title"
    >
      <div className="pilot-drawerHead">
        <div>
          <h2 id="pilot-add-student-title" className="pilot-drawerTitle">
            Add Student
          </h2>
          <p className="pilot-drawerSubtitle">
            Creates a participant and Parent/Guardian contact for this program. No family account
            is created yet.
          </p>
        </div>
        <button type="button" className="pilot-drawerClose" onClick={handleClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="pilot-drawerBody">
      <form className="pilot-drawerForm" onSubmit={(event) => void handleSubmit(event)}>
        <label className="pilot-drawerField">
          <span>Child first name</span>
          <input
            type="text"
            value={childFirstName}
            onChange={(event) => setChildFirstName(event.target.value)}
            required
          />
        </label>
        <label className="pilot-drawerField">
          <span>Child nickname (optional)</span>
          <input
            type="text"
            value={childNickname}
            onChange={(event) => setChildNickname(event.target.value)}
          />
        </label>
        <label className="pilot-drawerField">
          <span>Parent/Guardian first name</span>
          <input
            type="text"
            value={parentFirstName}
            onChange={(event) => setParentFirstName(event.target.value)}
          />
        </label>
        <label className="pilot-drawerField">
          <span>Parent/Guardian last name</span>
          <input
            type="text"
            value={parentLastName}
            onChange={(event) => setParentLastName(event.target.value)}
            required
          />
        </label>
        <label className="pilot-drawerField">
          <span>Parent/Guardian email</span>
          <input
            type="email"
            value={parentEmail}
            onChange={(event) => setParentEmail(event.target.value)}
            required
          />
        </label>
        <label className="pilot-drawerField">
          <span>Parent/Guardian phone (optional)</span>
          <input
            type="tel"
            value={parentPhone}
            onChange={(event) => setParentPhone(event.target.value)}
          />
        </label>
        <label className="pilot-drawerField">
          <span>{GRADE_LEVEL_LABEL} (recommended)</span>
          <select
            value={gradeLevel}
            onChange={(event) => {
              const next = event.target.value;
              setGradeLevel(isGradeLevel(next) ? next : '');
            }}
          >
            <option value="">Choose grade…</option>
            {GRADE_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="pilot-drawerFieldHint">{GRADE_LEVEL_ENCOURAGE}</span>
        </label>
        {error ? <p className="pilot-syncWarning">{error}</p> : null}

        <div className="pilot-drawerActions">
          <button type="button" className="pilot-drawerBtnSecondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="pilot-drawerBtnPrimary" disabled={!canSubmit}>
            {submitting ? 'Saving…' : 'Add Student'}
          </button>
        </div>
      </form>
      </div>
    </PilotDrawer>
  );
}
