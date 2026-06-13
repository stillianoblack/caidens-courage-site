import React from 'react';
import type { ActiveParticipantRosterEntry } from '../../types/activeParticipant';

type ActiveParticipantPickerModalProps = {
  open: boolean;
  roster: ActiveParticipantRosterEntry[];
  onSelect: (entry: ActiveParticipantRosterEntry) => void;
};

export default function ActiveParticipantPickerModal({
  open,
  roster,
  onSelect,
}: ActiveParticipantPickerModalProps) {
  if (!open) return null;

  return (
    <div className="activeParticipantPickerRoot" role="dialog" aria-modal="true" aria-labelledby="active-participant-picker-title">
      <div className="activeParticipantPickerBackdrop" aria-hidden="true" />
      <div className="activeParticipantPickerCard">
        <h2 id="active-participant-picker-title" className="activeParticipantPickerTitle">
          Who&apos;s playing today?
        </h2>
        <p className="activeParticipantPickerSubtitle">
          Pick the child doing missions so coins, badges, and B-4 check-ins stay on the right profile.
        </p>
        <div className="activeParticipantPickerGrid">
          {roster.map((child) => (
            <button
              key={child.participantId}
              type="button"
              className="activeParticipantPickerOption"
              onClick={() => onSelect(child)}
            >
              <span className="activeParticipantPickerAvatar" aria-hidden="true">
                {child.displayName.charAt(0).toUpperCase()}
              </span>
              <span className="activeParticipantPickerCopy">
                <span className="activeParticipantPickerName">{child.displayName}</span>
                {child.gradeLabel ? (
                  <span className="activeParticipantPickerMeta">{child.gradeLabel}</span>
                ) : (
                  <span className="activeParticipantPickerMeta">Player</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
