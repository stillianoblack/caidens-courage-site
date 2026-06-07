import React, { useState } from 'react';
import { B4_BASELINE_PRIVACY_NOTE, B4_BASELINE_STUDENT_HINT } from '../../data/b4BaselineCheckContent';

type B4BaselineStudentFormProps = {
  initialNickname?: string;
  initialProgramCode?: string;
  initialGroupName?: string;
  onSubmit: (values: { nickname: string; programCode: string; groupName: string }) => void;
};

export default function B4BaselineStudentForm({
  initialNickname = '',
  initialProgramCode = '',
  initialGroupName = '',
  onSubmit,
}: B4BaselineStudentFormProps) {
  const [nickname, setNickname] = useState(initialNickname);
  const [programCode, setProgramCode] = useState(initialProgramCode);
  const [groupName, setGroupName] = useState(initialGroupName);

  const canStart = nickname.trim().length > 0;

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
        <span className="bbc-fieldLabel">Nickname or first name</span>
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
        />
      </label>

      <label className="bbc-field">
        <span className="bbc-fieldLabel">Group or Classroom Name</span>
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
        Start Check
      </button>
    </form>
  );
}
