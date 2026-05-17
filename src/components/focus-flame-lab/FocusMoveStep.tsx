import React, { useState } from 'react';
import StepMicroFeedback from './StepMicroFeedback';
import { FOCUS_FLAME_MOVES, type FocusFlameMove } from './focusFlameMoves';
import { FOCUS_POINT_AWARDS } from './focusFlameRanks';

// TODO: /images/focus-flame/move-icons/
const MOVE_ICON: Record<FocusFlameMove, string> = {
  'Spark Breath': '◎',
  'Anchor Step': '⬇',
  'B-4 Pause': 'Ⅱ',
  'Flame Draw': '✎',
  'Brave Choice': '★',
};

export default function FocusMoveStep({
  value,
  onSelect,
  onNext,
  onNextClick,
  canProceed,
}: {
  value: FocusFlameMove | null;
  onSelect: (move: FocusFlameMove, isNew: boolean) => void;
  onNext: () => void;
  onNextClick: () => void;
  canProceed: boolean;
}) {
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  const handleSelect = (id: FocusFlameMove) => {
    const isNew = value !== id;
    onSelect(id, isNew);
    if (isNew) {
      setFeedbackKey((k) => k + 1);
      setConfirmMsg('Good choice.');
    }
  };

  return (
    <div className="ffl-selStep ffl-focusMoveStep">
      <header className="ffl-questionHeader ffl-step-header">
        <div className="ffl-kicker">STEP 3 OF 3</div>
        <h2 className="ffl-h2">Which Focus Flame move should we try?</h2>
      </header>

      <div className="ffl-focusMove-list" role="group" aria-label="Focus Flame move choices">
        {FOCUS_FLAME_MOVES.map((cfg) => (
          <button
            key={cfg.id}
            type="button"
            className={[
              'ffl-focusMove-card',
              value === cfg.id ? 'ffl-focusMove-card--selected' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={`Select ${cfg.id}`}
            aria-pressed={value === cfg.id}
            onClick={() => handleSelect(cfg.id)}
          >
            <span className="ffl-focusMove-icon" aria-hidden="true">
              {MOVE_ICON[cfg.id]}
            </span>
            <span className="ffl-focusMove-text">
              <span className="ffl-focusMove-title">
                {cfg.id} — {cfg.tagline}
              </span>
              <span className="ffl-focusMove-helper">{cfg.helper}</span>
            </span>
          </button>
        ))}
      </div>

      <StepMicroFeedback
        message={confirmMsg}
        points={value ? FOCUS_POINT_AWARDS.move : null}
        triggerKey={feedbackKey}
      />

      <div className="ffl-stepActions">
        <button
          type="button"
          className="ffl-ctaPrimary ffl-ctaPrimary--small"
          onClick={() => {
            onNextClick();
            onNext();
          }}
          disabled={!canProceed}
        >
          Practice this move
        </button>
      </div>
    </div>
  );
}
