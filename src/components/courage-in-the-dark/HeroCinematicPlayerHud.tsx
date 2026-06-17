import React, { useId, useState } from 'react';
import type { SelectableChild } from '../../hooks/useActiveChild';
import './hero-cinematic-player-hud.css';

export type HeroCinematicPlayerHudProps = {
  displayName: string;
  focusCoins: number;
  focusCoinsLoading?: boolean;
  weekLabel?: string | null;
  children?: SelectableChild[];
  activeParticipantId?: string;
  onSelectChild?: (child: SelectableChild) => void;
  childSwitchLoading?: boolean;
  className?: string;
};

function resolveInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export default function HeroCinematicPlayerHud({
  displayName,
  focusCoins,
  focusCoinsLoading = false,
  weekLabel,
  children = [],
  activeParticipantId = '',
  onSelectChild,
  childSwitchLoading = false,
  className = '',
}: HeroCinematicPlayerHudProps) {
  const selectId = useId();
  const [pendingChild, setPendingChild] = useState<SelectableChild | null>(null);
  const canSwitch = children.length > 1 && onSelectChild;

  const handleChange = (participantId: string) => {
    if (!onSelectChild || participantId === activeParticipantId) return;
    const next = children.find((child) => child.participantId === participantId);
    if (next) setPendingChild(next);
  };

  const confirmSwitch = () => {
    if (pendingChild && onSelectChild) {
      onSelectChild(pendingChild);
      setPendingChild(null);
    }
  };

  return (
    <>
      <div
        className={[
          'heroCinematicPlayerHud',
          childSwitchLoading ? 'heroCinematicPlayerHud--loading' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Player status"
      >
        <div className="heroCinematicPlayerHudAvatar" aria-hidden="true">
          {resolveInitial(displayName)}
        </div>
        <div className="heroCinematicPlayerHudCopy">
          <p className="heroCinematicPlayerHudEyebrow">Playing as</p>
          {canSwitch ? (
            <label className="heroCinematicPlayerHudNameRow" htmlFor={selectId}>
              <select
                id={selectId}
                className="heroCinematicPlayerHudSelect"
                value={activeParticipantId || children[0]?.participantId}
                onChange={(event) => handleChange(event.target.value)}
                disabled={childSwitchLoading}
              >
                {children.map((child) => (
                  <option key={child.participantId} value={child.participantId}>
                    {child.displayName}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="heroCinematicPlayerHudName">{displayName}</p>
          )}
          {weekLabel ? <p className="heroCinematicPlayerHudWeek">{weekLabel}</p> : null}
        </div>
        <div className="heroCinematicPlayerHudCoins" aria-label={`${focusCoins} Focus Coins`}>
          <span className="heroCinematicPlayerHudCoinIcon" aria-hidden="true" />
          <span className="heroCinematicPlayerHudCoinValue">
            {focusCoinsLoading ? '…' : focusCoins.toLocaleString()}
          </span>
        </div>
      </div>

      {pendingChild ? (
        <div className="playingAsConfirmBackdrop" role="presentation">
          <div
            className="playingAsConfirmDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hud-playing-as-confirm-title"
          >
            <h3 id="hud-playing-as-confirm-title" className="playingAsConfirmTitle">
              Switch to {pendingChild.displayName}?
            </h3>
            <p className="playingAsConfirmBody">
              Your adventure map, rewards, and progress will update for this player.
            </p>
            <div className="playingAsConfirmActions">
              <button type="button" className="playingAsConfirmCancel" onClick={() => setPendingChild(null)}>
                Cancel
              </button>
              <button type="button" className="playingAsConfirmConfirm" onClick={confirmSwitch}>
                Switch
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
