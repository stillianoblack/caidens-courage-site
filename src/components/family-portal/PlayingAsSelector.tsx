import React, { useId, useState } from 'react';
import type { SelectableChild } from '../../hooks/useActiveChild';
import './playing-as-selector.css';

type PlayingAsSelectorProps = {
  children: SelectableChild[];
  activeParticipantId?: string;
  onSelect: (child: SelectableChild) => void;
  loading?: boolean;
  className?: string;
};

export default function PlayingAsSelector({
  children,
  activeParticipantId = '',
  onSelect,
  loading = false,
  className = '',
}: PlayingAsSelectorProps) {
  const selectId = useId();
  const [pendingChild, setPendingChild] = useState<SelectableChild | null>(null);

  if (children.length === 0) return null;

  const activeChild =
    children.find((child) => child.participantId === activeParticipantId) ?? children[0];

  const handleChange = (participantId: string) => {
    if (participantId === activeParticipantId) return;
    const next = children.find((child) => child.participantId === participantId);
    if (next) setPendingChild(next);
  };

  const confirmSwitch = () => {
    if (pendingChild) {
      onSelect(pendingChild);
      setPendingChild(null);
    }
  };

  return (
    <>
      <div className={`playingAsSelector${loading ? ' playingAsSelector--loading' : ''}${className ? ` ${className}` : ''}`}>
        <label className="playingAsSelectorLabel" htmlFor={selectId}>
          Playing as
        </label>
        {children.length === 1 ? (
          <span className="playingAsSelectorName">{activeChild.displayName}</span>
        ) : (
          <select
            id={selectId}
            className="playingAsSelectorSelect"
            value={activeParticipantId || activeChild.participantId}
            onChange={(event) => handleChange(event.target.value)}
            disabled={loading}
          >
            {children.map((child) => (
              <option key={child.participantId} value={child.participantId}>
                {child.displayName}
              </option>
            ))}
          </select>
        )}
        {loading ? <span className="playingAsSelectorShimmer" aria-hidden="true" /> : null}
      </div>

      {pendingChild ? (
        <div className="playingAsConfirmBackdrop" role="presentation">
          <div
            className="playingAsConfirmDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="playing-as-confirm-title"
          >
            <h3 id="playing-as-confirm-title" className="playingAsConfirmTitle">
              Switch to {pendingChild.displayName}?
            </h3>
            <p className="playingAsConfirmBody">
              Your adventure map, rewards, and progress will update for this player.
            </p>
            <div className="playingAsConfirmActions">
              <button type="button" className="playingAsConfirmBtn" onClick={() => setPendingChild(null)}>
                Cancel
              </button>
              <button type="button" className="playingAsConfirmBtn playingAsConfirmBtn--primary" onClick={confirmSwitch}>
                Switch player
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
