import React, { useState } from 'react';
import StepMicroFeedback from './StepMicroFeedback';
import type { BodySignal } from './focusFlameSelTypes';
import { FOCUS_POINT_AWARDS } from './focusFlameRanks';

const HOTSPOTS: { id: BodySignal; label: string; className: string }[] = [
  { id: 'Head', label: 'Head', className: 'ffl-bodyHotspot--head' },
  { id: 'Chest', label: 'Chest', className: 'ffl-bodyHotspot--chest' },
  { id: 'Hands', label: 'Hands', className: 'ffl-bodyHotspot--hands' },
  { id: 'Stomach', label: 'Stomach', className: 'ffl-bodyHotspot--stomach' },
];

export default function BodySignalStep({
  value,
  onSelect,
  onNext,
  onNextClick,
  canProceed,
}: {
  value: BodySignal | null;
  onSelect: (body: BodySignal, isNew: boolean) => void;
  onNext: () => void;
  onNextClick: () => void;
  canProceed: boolean;
}) {
  const [feedbackKey, setFeedbackKey] = useState(0);

  const handleSelect = (opt: BodySignal) => {
    const isNew = value !== opt;
    onSelect(opt, isNew);
    if (isNew) setFeedbackKey((k) => k + 1);
  };

  return (
    <div className="ffl-selStep ffl-bodySignalStep">
      <header className="ffl-questionHeader ffl-step-header">
        <div className="ffl-kicker">STEP 2 OF 3</div>
        <h2 className="ffl-h2">Where does Caiden feel it in his body?</h2>
      </header>

      <div className="ffl-bodySignal-card" role="group" aria-label="Body signal hotspots">
        {/* TODO: /images/focus-flame/body-silhouette.svg */}
        <div className="ffl-bodySilhouette" aria-hidden="true">
          <div className="ffl-bodySilhouette-head" />
          <div className="ffl-bodySilhouette-torso" />
          <div className="ffl-bodySilhouette-stomachGlow" />
        </div>
        {HOTSPOTS.map((spot) => (
          <button
            key={spot.id}
            type="button"
            className={[
              'ffl-bodyHotspot',
              spot.className,
              value === spot.id ? 'ffl-bodyHotspot--selected' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={`Select ${spot.label}`}
            aria-pressed={value === spot.id}
            onClick={() => handleSelect(spot.id)}
          >
            <span className="ffl-bodyHotspot-label">{spot.label}</span>
          </button>
        ))}
      </div>

      <StepMicroFeedback
        message={value ? 'Good listening. Bodies give us clues.' : null}
        points={value ? FOCUS_POINT_AWARDS.body : null}
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
          Next
        </button>
      </div>
    </div>
  );
}
