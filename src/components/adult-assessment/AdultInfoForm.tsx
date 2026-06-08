import React, { useState } from 'react';
import {
  ADULT_INFO_HELPER_TEXT,
  ADULT_ROLE_OPTIONS,
  type AdultRoleOption,
} from '../../data/adultGrowthCheckContent';
import type { AdultAssessmentProfile } from '../../lib/adultAssessmentStorage';

type AdultInfoFormProps = {
  initialFirstName?: string;
  initialEmail?: string;
  initialProgramCode?: string;
  programCodeReadOnly?: boolean;
  onSubmit: (profile: AdultAssessmentProfile) => void;
};

export default function AdultInfoForm({
  initialFirstName = '',
  initialEmail = '',
  initialProgramCode = '',
  programCodeReadOnly = false,
  onSubmit,
}: AdultInfoFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState<AdultRoleOption>('Parent');
  const [childAgeRange, setChildAgeRange] = useState('');
  const [organization, setOrganization] = useState('');
  const [programCode, setProgramCode] = useState(initialProgramCode);
  const [emailOptIn, setEmailOptIn] = useState(true);

  const canStart =
    firstName.trim().length > 0 && email.trim().length > 0 && role.trim().length > 0;

  return (
    <form
      className="bbc-studentForm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canStart) return;
        onSubmit({
          firstName: firstName.trim(),
          email: email.trim(),
          role,
          childAgeRange: childAgeRange.trim() || undefined,
          organization: organization.trim() || undefined,
          emailOptIn,
          programCode: programCode.trim(),
        });
      }}
    >
      <p className="bbc-privacyNote" role="note">
        {ADULT_INFO_HELPER_TEXT}
      </p>

      <label className="bbc-field">
        <span className="bbc-fieldLabel">First Name</span>
        <input
          type="text"
          className="bbc-fieldInput"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          maxLength={48}
          required
        />
      </label>

      <label className="bbc-field">
        <span className="bbc-fieldLabel">Email</span>
        <input
          type="email"
          className="bbc-fieldInput"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          maxLength={120}
          required
        />
      </label>

      <label className="bbc-field">
        <span className="bbc-fieldLabel">Role</span>
        <select
          className="bbc-fieldInput"
          value={role}
          onChange={(e) => setRole(e.target.value as AdultRoleOption)}
          required
        >
          {ADULT_ROLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="bbc-field">
        <span className="bbc-fieldLabel">Child Age Range (optional)</span>
        <input
          type="text"
          className="bbc-fieldInput"
          value={childAgeRange}
          onChange={(e) => setChildAgeRange(e.target.value)}
          autoComplete="off"
          maxLength={48}
          placeholder="Ages 7–9"
        />
      </label>

      <label className="bbc-field">
        <span className="bbc-fieldLabel">Organization (optional)</span>
        <input
          type="text"
          className="bbc-fieldInput"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          autoComplete="organization"
          maxLength={80}
          placeholder="School or camp name"
        />
      </label>

      <label className="bbc-field">
        <span className="bbc-fieldLabel">Program code</span>
        <input
          type="text"
          className="bbc-fieldInput"
          value={programCode}
          onChange={(e) => setProgramCode(e.target.value)}
          autoComplete="off"
          maxLength={48}
          placeholder="FFA-PILOT-2026"
          readOnly={programCodeReadOnly && Boolean(initialProgramCode)}
        />
      </label>

      <label className="bbc-checkboxField">
        <input
          type="checkbox"
          checked={emailOptIn}
          onChange={(e) => setEmailOptIn(e.target.checked)}
        />
        <span>Email me future Focus Flame Academy resources and family activities.</span>
      </label>

      <button type="submit" className="bbc-primaryBtn bbc-landingCta" disabled={!canStart}>
        Continue to Assessment
      </button>
    </form>
  );
}
