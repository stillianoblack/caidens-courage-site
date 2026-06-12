import React, { useState } from 'react';
import { readActivePilotProgram } from '../../config/activePilotProgram';
import { createCampChildWithParentLink } from '../../lib/campChildOnboardingService';
import {
  GRADE_LEVEL_ENCOURAGE,
  GRADE_LEVEL_LABEL,
  GRADE_LEVEL_OPTIONS,
  isGradeLevel,
  type GradeLevel,
} from '../../data/gradeLevelOptions';
import { isIndependentFamilyProgram } from '../../lib/independentFamilyProgram';

export default function CampChildOnboardingCard() {
  const activeProgram = readActivePilotProgram();
  const campProgramCode = activeProgram?.programCode?.trim() ?? '';

  const [childFirstName, setChildFirstName] = useState('');
  const [childNickname, setChildNickname] = useState('');
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!campProgramCode || isIndependentFamilyProgram(activeProgram)) {
    return null;
  }

  const canSubmit =
    childFirstName.trim().length > 0 &&
    parentLastName.trim().length > 0 &&
    parentEmail.trim().length > 0 &&
    !submitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setMessage(null);
    setError(null);

    const result = await createCampChildWithParentLink({
      childFirstName: childFirstName.trim(),
      childNickname: childNickname.trim() || undefined,
      parentFirstName: parentFirstName.trim(),
      parentLastName: parentLastName.trim(),
      parentEmail: parentEmail.trim(),
      parentPhone: parentPhone.trim() || undefined,
      gradeLevel: isGradeLevel(gradeLevel) ? gradeLevel : undefined,
      campProgramCode,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(result.message);
    setChildFirstName('');
    setChildNickname('');
    setParentFirstName('');
    setParentLastName('');
    setParentEmail('');
    setParentPhone('');
    setGradeLevel('');
  };

  return (
    <section className="pilot-parentLinkCard" aria-labelledby="pilot-camp-onboard-title">
      <div className="pilot-parentLinkHead">
        <h3 id="pilot-camp-onboard-title" className="pilot-parentLinkTitle">
          Add Camp Child + Parent/Guardian Contact
        </h3>
        <p className="pilot-parentLinkCopy">
          Onboard a child under your camp program and store parent contact for later Family Portal
          claim. No family account is created yet — progress stays on the child&apos;s participant
          record.
        </p>
      </div>

      <form className="pilot-parentLinkForm" onSubmit={(event) => void handleSubmit(event)}>
        <label className="pilot-parentLinkField">
          <span className="pilot-parentLinkLabel">Child first name</span>
          <input
            className="pilot-parentLinkInput"
            value={childFirstName}
            onChange={(event) => setChildFirstName(event.target.value)}
            required
            maxLength={32}
          />
        </label>

        <label className="pilot-parentLinkField">
          <span className="pilot-parentLinkLabel">Child nickname (optional)</span>
          <input
            className="pilot-parentLinkInput"
            value={childNickname}
            onChange={(event) => setChildNickname(event.target.value)}
            maxLength={32}
          />
        </label>

        <label className="pilot-parentLinkField">
          <span className="pilot-parentLinkLabel">Parent/Guardian first name</span>
          <input
            className="pilot-parentLinkInput"
            value={parentFirstName}
            onChange={(event) => setParentFirstName(event.target.value)}
            maxLength={48}
          />
        </label>

        <label className="pilot-parentLinkField">
          <span className="pilot-parentLinkLabel">Parent/Guardian last name</span>
          <input
            className="pilot-parentLinkInput"
            value={parentLastName}
            onChange={(event) => setParentLastName(event.target.value)}
            required
            maxLength={48}
          />
        </label>

        <label className="pilot-parentLinkField">
          <span className="pilot-parentLinkLabel">Parent/Guardian email</span>
          <input
            type="email"
            className="pilot-parentLinkInput"
            value={parentEmail}
            onChange={(event) => setParentEmail(event.target.value)}
            required
            placeholder="parent@email.com"
          />
        </label>

        <label className="pilot-parentLinkField">
          <span className="pilot-parentLinkLabel">Parent/Guardian phone (optional)</span>
          <input
            type="tel"
            className="pilot-parentLinkInput"
            value={parentPhone}
            onChange={(event) => setParentPhone(event.target.value)}
            placeholder="5551234567"
          />
        </label>

        <label className="pilot-parentLinkField">
          <span className="pilot-parentLinkLabel">{GRADE_LEVEL_LABEL} (recommended)</span>
          <select
            className="pilot-parentLinkInput"
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
          <span className="pilot-parentLinkHint">{GRADE_LEVEL_ENCOURAGE}</span>
        </label>

        {message ? (
          <p className="pilot-parentLinkMessage pilot-parentLinkMessage--success" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="pilot-parentLinkMessage pilot-parentLinkMessage--error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="pilot-parentLinkBtn" disabled={!canSubmit}>
          {submitting ? 'Saving…' : 'Add Child + Parent/Guardian Contact'}
        </button>
      </form>
    </section>
  );
}
