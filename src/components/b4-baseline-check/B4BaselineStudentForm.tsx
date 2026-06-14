import React, { useState } from 'react';
import { B4_BASELINE_PRIVACY_NOTE, B4_BASELINE_STUDENT_HINT } from '../../data/b4BaselineCheckContent';

type B4BaselineStudentFormProps = {
  initialFirstName?: string;
  initialNickname?: string;
  initialProgramCode?: string;
  initialGroupName?: string;
  familyPortal?: boolean;
  submitting?: boolean;
  onSubmit: (values: {
    firstName?: string;
    nickname: string;
    programCode: string;
    groupName: string;
  }) => void;
};

export default function B4BaselineStudentForm({
  initialFirstName = '',
  initialNickname = '',
  initialProgramCode = '',
  initialGroupName = '',
  familyPortal = false,
  submitting = false,
  onSubmit,
}: B4BaselineStudentFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [nickname, setNickname] = useState(initialNickname);
  const [programCode, setProgramCode] = useState(initialProgramCode);
  const [groupName, setGroupName] = useState(initialGroupName);

  const displayName = familyPortal
    ? nickname.trim() || firstName.trim()
    : nickname.trim();
  const canStart = displayName.length > 0 && !submitting;
  const nicknameLabel = familyPortal ? 'Nickname (optional)' : 'Nickname or first name';
  const groupLabel = familyPortal ? 'Group or classroom (optional)' : 'Group or Classroom Name';
  const startLabel = familyPortal ? 'Start B-4 Check-In' : 'Start Check';

  return (
    <form
      className="bbc-studentForm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canStart) return;
        const resolvedNickname = familyPortal
          ? nickname.trim() || firstName.trim()
          : nickname.trim();
        onSubmit({
          firstName: familyPortal ? firstName.trim() || resolvedNickname : undefined,
          nickname: resolvedNickname,
          programCode: programCode.trim(),
          groupName: groupName.trim(),
        });
      }}
    >
      <p className="bbc-privacyNote" role="note">
        {B4_BASELINE_PRIVACY_NOTE}
      </p>

      {familyPortal ? (
        <label className="bbc-field">
          <span className="bbc-fieldLabel">First name</span>
          <input
            type="text"
            className="bbc-fieldInput"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="off"
            maxLength={32}
            placeholder="Alex"
            required
          />
          <span className="bbc-fieldHint">{B4_BASELINE_STUDENT_HINT}</span>
        </label>
      ) : null}

      <label className="bbc-field">
        <span className="bbc-fieldLabel">{familyPortal ? nicknameLabel : 'Nickname or first name'}</span>
        <input
          type="text"
          className="bbc-fieldInput"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          autoComplete="off"
          maxLength={32}
          placeholder={familyPortal ? 'Ace' : 'Alex'}
          required={!familyPortal}
        />
        {!familyPortal ? <span className="bbc-fieldHint">{B4_BASELINE_STUDENT_HINT}</span> : null}
      </label>

      {!familyPortal ? (
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
            readOnly={Boolean(initialProgramCode)}
          />
        </label>
      ) : null}

      {!familyPortal ? (
        <label className="bbc-field">
          <span className="bbc-fieldLabel">{groupLabel}</span>
          <input
            type="text"
            className="bbc-fieldInput"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoComplete="off"
            maxLength={48}
            placeholder="Room 12 — Morning"
          />
        </label>
      ) : null}

      <button type="submit" className="bbc-primaryBtn bbc-landingCta" disabled={!canStart}>
        {submitting ? 'Starting…' : startLabel}
      </button>
    </form>
  );
}
