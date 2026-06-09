import React, { useState } from 'react';
import {
  ADULT_INFO_HELPER_TEXT,
  ADULT_ROLE_OPTIONS,
  type AdultRoleOption,
} from '../../data/adultGrowthCheckContent';
import type { AdultAssessmentProfile } from '../../lib/adultAssessmentStorage';

type AdultInfoFormProps = {
  initialFirstName?: string;
  initialLastName?: string;
  initialEmail?: string;
  initialChildFirstName?: string;
  initialChildNickname?: string;
  initialProgramCode?: string;
  programCodeReadOnly?: boolean;
  collectChildLinking?: boolean;
  submitting?: boolean;
  onSubmit: (profile: AdultAssessmentProfile) => void;
};

export default function AdultInfoForm({
  initialFirstName = '',
  initialLastName = '',
  initialEmail = '',
  initialChildFirstName = '',
  initialChildNickname = '',
  initialProgramCode = '',
  programCodeReadOnly = false,
  collectChildLinking = false,
  submitting = false,
  onSubmit,
}: AdultInfoFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialEmail);
  const [childFirstName, setChildFirstName] = useState(initialChildFirstName);
  const [childNickname, setChildNickname] = useState(initialChildNickname);
  const [role, setRole] = useState<AdultRoleOption>('Parent');
  const [childAgeRange, setChildAgeRange] = useState('');
  const [organization, setOrganization] = useState('');
  const [programCode, setProgramCode] = useState(initialProgramCode);
  const [emailOptIn, setEmailOptIn] = useState(true);

  const canStart =
    firstName.trim().length > 0 &&
    email.trim().length > 0 &&
    role.trim().length > 0 &&
    (!collectChildLinking ||
      (lastName.trim().length > 0 && childFirstName.trim().length > 0)) &&
    !submitting;

  return (
    <form
      className="bbc-studentForm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canStart) return;
        onSubmit({
          firstName: firstName.trim(),
          lastName: collectChildLinking ? lastName.trim() : undefined,
          email: email.trim(),
          role,
          childFirstName: collectChildLinking ? childFirstName.trim() : undefined,
          childNickname: collectChildLinking ? childNickname.trim() || undefined : undefined,
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

      {collectChildLinking ? (
        <p className="bbc-privacyNote" role="note">
          We&apos;ll set up your private family portal and link your child. Camp access codes do not
          share other families&apos; results.
        </p>
      ) : null}

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

      {collectChildLinking ? (
        <label className="bbc-field">
          <span className="bbc-fieldLabel">Last Name</span>
          <input
            type="text"
            className="bbc-fieldInput"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            maxLength={48}
            required
          />
        </label>
      ) : null}

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

      {collectChildLinking ? (
        <>
          <label className="bbc-field">
            <span className="bbc-fieldLabel">Child first name</span>
            <input
              type="text"
              className="bbc-fieldInput"
              value={childFirstName}
              onChange={(e) => setChildFirstName(e.target.value)}
              autoComplete="off"
              maxLength={32}
              required
            />
          </label>

          <label className="bbc-field">
            <span className="bbc-fieldLabel">Child nickname (optional)</span>
            <input
              type="text"
              className="bbc-fieldInput"
              value={childNickname}
              onChange={(e) => setChildNickname(e.target.value)}
              autoComplete="off"
              maxLength={32}
              placeholder="Ace"
            />
          </label>
        </>
      ) : null}

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

      {!collectChildLinking ? (
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
      ) : null}

      <label className="bbc-checkboxField">
        <input
          type="checkbox"
          checked={emailOptIn}
          onChange={(e) => setEmailOptIn(e.target.checked)}
        />
        <span>Email me future Focus Flame Academy resources and family activities.</span>
      </label>

      <button type="submit" className="bbc-primaryBtn bbc-landingCta" disabled={!canStart}>
        {submitting ? 'Setting up your family portal…' : 'Continue to Assessment'}
      </button>
    </form>
  );
}
