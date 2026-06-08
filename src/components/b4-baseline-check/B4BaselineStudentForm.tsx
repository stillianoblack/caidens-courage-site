import React, { useState } from 'react';
import { B4_BASELINE_PRIVACY_NOTE, B4_BASELINE_STUDENT_HINT } from '../../data/b4BaselineCheckContent';

type B4BaselineStudentFormProps = {
  initialNickname?: string;
  initialProgramCode?: string;
  initialGroupName?: string;
  familyPortal?: boolean;
  onSubmit: (values: { nickname: string; programCode: string; groupName: string }) => void;
};

export default function B4BaselineStudentForm({
  initialNickname = '',
  initialProgramCode = '',
  initialGroupName = '',
  familyPortal = false,
  onSubmit,
}: B4BaselineStudentFormProps) {
  const [nickname, setNickname] = useState(initialNickname);
  const [programCode, setProgramCode] = useState(initialProgramCode);
  const [groupName, setGroupName] = useState(initialGroupName);

  const canStart = nickname.trim().length > 0;
  const nicknameLabel = familyPortal ? 'Child nickname' : 'Nickname or first name';
  const groupLabel = familyPortal ? 'Group or classroom (optional)' : 'Group or Classroom Name';
  const startLabel = familyPortal ? 'Start B-4 Check-In' : 'Start Check';

  return (
    <form
      className="bbc-studentForm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canStart) return;
        onSubmit({
          nickname: nickname.trim(),
          programCode: programCode.trim(),
          groupName: groupName.trim(),
        });
      }}
    >
      <p className="bbc-privacyNote" role="note">
        {B4_BASELINE_PRIVACY_NOTE}
      </p>

      <label className="bbc-field">
        <span className="bbc-fieldLabel">{nicknameLabel}</span>
        <input
          type="text"
          className="bbc-fieldInput"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          autoComplete="off"
          maxLength={32}
          placeholder="Alex"
          required
        />
        <span className="bbc-fieldHint">{B4_BASELINE_STUDENT_HINT}</span>
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
          readOnly={familyPortal && Boolean(initialProgramCode)}
        />
      </label>

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

      <button type="submit" className="bbc-primaryBtn bbc-landingCta" disabled={!canStart}>
        {startLabel}
      </button>
    </form>
  );
}
