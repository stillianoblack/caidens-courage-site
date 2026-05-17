import React, { useState } from 'react';
import StepMicroFeedback from './StepMicroFeedback';
import type { BodySignal } from './focusFlameSelTypes';
import { FOCUS_POINT_AWARDS } from './focusFlameRanks';

const CAIDEN_BODY_SILHOUETTE_SRC =
  `${process.env.PUBLIC_URL ?? ''}/images/focus-flame-lab/caiden-body-silhouette.svg`;

type HudZone = {
  id: BodySignal;
  label: string;
  side: 'left' | 'right';
  hotspotClass: string;
  line: { x1: number; y1: number; x2: number; y2: number };
};

/** Connector endpoints use HUD viewBox 0–100 (silhouette centered ~34–66% x). */
const HUD_ZONES: HudZone[] = [
  { id: 'Head', label: 'Head', side: 'left', hotspotClass: 'ffl-bodyZone--head', line: { x1: 15, y1: 12, x2: 36, y2: 17 } },
  { id: 'Hands', label: 'Hands', side: 'left', hotspotClass: 'ffl-bodyZone--handLeft', line: { x1: 15, y1: 60, x2: 69, y2: 62 } },
  { id: 'Chest', label: 'Chest', side: 'right', hotspotClass: 'ffl-bodyZone--chest', line: { x1: 85, y1: 26, x2: 64, y2: 30 } },
  { id: 'Stomach', label: 'Stomach', side: 'right', hotspotClass: 'ffl-bodyZone--stomach', line: { x1: 85, y1: 47, x2: 63, y2: 46 } },
];

const FALLBACK_HOTSPOTS: { id: BodySignal; label: string; className: string }[] = [
  { id: 'Head', label: 'Head', className: 'ffl-bodyHotspot--head' },
  { id: 'Chest', label: 'Chest', className: 'ffl-bodyHotspot--chest' },
  { id: 'Hands', label: 'Hands', className: 'ffl-bodyHotspot--hands' },
  { id: 'Stomach', label: 'Stomach', className: 'ffl-bodyHotspot--stomach' },
];

function hotspotClass(selected: boolean, hasSelection: boolean, extra?: string) {
  return [
    'ffl-bodyHotspot',
    'body-zone',
    extra,
    selected ? 'ffl-bodyHotspot--selected' : '',
    hasSelection && !selected ? 'ffl-bodyHotspot--dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function sideLabelClass(id: BodySignal, selected: boolean, hasSelection: boolean, side: 'left' | 'right') {
  return [
    'ffl-bodySignal-sideLabel',
    `ffl-bodySignal-sideLabel--${side}`,
    `ffl-bodySignal-sideLabel--${id}`,
    selected ? 'ffl-bodySignal-sideLabel--selected' : '',
    hasSelection && !selected ? 'ffl-bodySignal-sideLabel--dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function BodySignalFallback({
  value,
  onSelect,
}: {
  value: BodySignal | null;
  onSelect: (opt: BodySignal) => void;
}) {
  return (
    <>
      <div className="ffl-bodySilhouette" aria-hidden="true">
        <div className="ffl-bodySilhouette-head" />
        <div className="ffl-bodySilhouette-torso" />
        <div className="ffl-bodySilhouette-stomachGlow" />
      </div>
      {FALLBACK_HOTSPOTS.map((spot) => (
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
          onClick={() => onSelect(spot.id)}
        >
          <span className="ffl-bodyHotspot-label">{spot.label}</span>
        </button>
      ))}
    </>
  );
}

function CaidenBodySilhouette({
  value,
  onSelect,
  onImageError,
}: {
  value: BodySignal | null;
  onSelect: (opt: BodySignal) => void;
  onImageError: () => void;
}) {
  const hasSelection = value != null;
  const handsSelected = value === 'Hands';

  const isZoneSelected = (id: BodySignal) => value === id;

  return (
    <div
      className="ffl-bodySignal-hud"
      data-selected={value ?? ''}
    >
      <svg
        className="ffl-bodySignal-connectors"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {HUD_ZONES.map((zone) => (
          <line
            key={zone.id}
            className={[
              'ffl-bodySignal-line',
              `ffl-bodySignal-line--${zone.id}`,
              isZoneSelected(zone.id) ? 'ffl-bodySignal-line--selected' : '',
              hasSelection && !isZoneSelected(zone.id) ? 'ffl-bodySignal-line--dimmed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            x1={zone.line.x1}
            y1={zone.line.y1}
            x2={zone.line.x2}
            y2={zone.line.y2}
          />
        ))}
      </svg>

      <div className="ffl-bodySilhouette-wrap body-silhouette-wrap">
        <img
          src={CAIDEN_BODY_SILHOUETTE_SRC}
          alt=""
          className="ffl-bodySilhouette-img"
          aria-hidden="true"
          draggable={false}
          onError={onImageError}
        />
        {HUD_ZONES.filter((z) => z.id !== 'Hands').map((zone) => (
          <button
            key={zone.id}
            type="button"
            className={hotspotClass(isZoneSelected(zone.id), hasSelection, zone.hotspotClass)}
            aria-label={`Select ${zone.label}`}
            aria-pressed={isZoneSelected(zone.id)}
            onClick={() => onSelect(zone.id)}
          >
            <span className="ffl-bodyHotspot-ring" aria-hidden="true" />
          </button>
        ))}
        <button
          type="button"
          className={hotspotClass(handsSelected, hasSelection, 'ffl-bodyZone--handLeft')}
          aria-label="Select Hands"
          aria-pressed={handsSelected}
          onClick={() => onSelect('Hands')}
        >
          <span className="ffl-bodyHotspot-ring" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={hotspotClass(handsSelected, hasSelection, 'ffl-bodyZone--handRight')}
          aria-label="Select Hands"
          aria-pressed={handsSelected}
          onClick={() => onSelect('Hands')}
        >
          <span className="ffl-bodyHotspot-ring" aria-hidden="true" />
        </button>
      </div>

      {HUD_ZONES.map((zone) => (
        <button
          key={`label-${zone.id}`}
          type="button"
          className={sideLabelClass(zone.id, isZoneSelected(zone.id), hasSelection, zone.side)}
          aria-label={`Select ${zone.label}`}
          aria-pressed={isZoneSelected(zone.id)}
          onClick={() => onSelect(zone.id)}
        >
          {zone.label}
        </button>
      ))}
    </div>
  );
}

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
  const [useFallback, setUseFallback] = useState(false);

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

      <div
        className={[
          'ffl-bodySignal-card',
          !useFallback ? 'ffl-bodySignal-card--silhouette' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="group"
        aria-label="Body signal hotspots"
      >
        {useFallback ? (
          <BodySignalFallback value={value} onSelect={handleSelect} />
        ) : (
          <CaidenBodySilhouette
            value={value}
            onSelect={handleSelect}
            onImageError={() => setUseFallback(true)}
          />
        )}
      </div>

      <div className="ffl-bodySignal-feedback">
        <StepMicroFeedback
          message={value ? 'Good listening. Bodies give us clues.' : null}
          points={value ? FOCUS_POINT_AWARDS.body : null}
          triggerKey={feedbackKey}
        />
      </div>

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
