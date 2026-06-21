import React, { useState } from 'react';
import { B4_BASELINE_PRIVACY_NOTE } from '../../data/b4BaselineCheckContent';

export type BaselineStudentOption = {
  participantId: string;
  displayLabel: string;
};

type B4BaselineStudentFormProps = {
  initialFirstName?: string;
  initialNickname?: string;
  initialProgramCode?: string;
  initialGroupName?: string;
  familyPortal?: boolean;
  facilitatorMode?: boolean;
  studentOptions?: BaselineStudentOption[];
  selectedStudentId?: string;
  onStudentChange?: (participantId: string) => void;
  allBaselinesComplete?: boolean;
  submitting?: boolean;
  onSubmit: (values: {
    firstName?: string;
    nickname: string;
    programCode: string;
    groupName: string;
    participantId?: string;
  }) => void;
};

export default function B4BaselineStudentForm({
  initialFirstName = '',
  initialNickname = '',
  initialProgramCode = '',
  initialGroupName = '',
  familyPortal = false,
  facilitatorMode = false,
  studentOptions = [],
  selectedStudentId = '',
  onStudentChange,
  allBaselinesComplete = false,
  submitting = false,
  onSubmit,
}: B4BaselineStudentFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [nickname, setNickname] = useState(initialNickname);
  const [programCode, setProgramCode] = useState(initialProgramCode);
  const [groupName, setGroupName] = useState(initialGroupName);

  const selectedOption = studentOptions.find((row) => row.participantId === selectedStudentId);
  const displayName = facilitatorMode
    ? selectedOption?.displayLabel ?? ''
    : familyPortal
      ? nickname.trim() || firstName.trim()
      : nickname.trim();
  const canStart =
    displayName.length > 0 && !submitting && !allBaselinesComplete && (!facilitatorMode || Boolean(selectedStudentId));
  const startLabel = familyPortal ? 'Start B-4 Check-In' : 'Start Check';

  return (
    <form
      className="bbc-studentForm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canStart) return;
        const resolvedNickname = facilitatorMode
          ? selectedOption?.displayLabel.split(' (')[0]?.trim() || displayName
          : familyPortal
            ? nickname.trim() || firstName.trim()
            : nickname.trim();
        onSubmit({
          firstName: familyPortal ? firstName.trim() || resolvedNickname : undefined,
          nickname: resolvedNickname,
          programCode: programCode.trim(),
          groupName: groupName.trim(),
          participantId: facilitatorMode ? selectedStudentId : undefined,
        });
      }}
    >
      <p className="bbc-privacyNote" role="note">
        {B4_BASELINE_PRIVACY_NOTE}
      </p>

      {facilitatorMode ? (
        allBaselinesComplete ? (
          <p className="bbc-fieldHint" role="status">
            All students have completed the B-4 Baseline.
          </p>
        ) : (
          <label className="bbc-field">
            <span className="bbc-fieldLabel">Select student</span>
            <select
              className="bbc-fieldInput"
              value={selectedStudentId}
              onChange={(event) => onStudentChange?.(event.target.value)}
              disabled={submitting || studentOptions.length <= 1}
              required
            >
              {studentOptions.map((option) => (
                <option key={option.participantId} value={option.participantId}>
                  {option.displayLabel}
                </option>
              ))}
            </select>
          </label>
        )
      ) : null}

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
        </label>
      ) : null}

      {!facilitatorMode ? (
        <label className="bbc-field">
          <span className="bbc-fieldLabel">
            {familyPortal ? 'Nickname (optional)' : 'Nickname or first name'}
          </span>
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
        </label>
      ) : null}

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
          <span className="bbc-fieldLabel">
            {familyPortal ? 'Group or classroom (optional)' : 'Group or Classroom Name'}
          </span>
          <input
            type="text"
            className="bbc-fieldInput"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoComplete="off"
            maxLength={48}
            placeholder="Room 12 — Morning"
            readOnly={facilitatorMode && Boolean(initialGroupName)}
          />
        </label>
      ) : null}

      <button type="submit" className="bbc-primaryBtn bbc-landingCta" disabled={!canStart}>
        {submitting ? 'Starting…' : startLabel}
      </button>
    </form>
  );
}
