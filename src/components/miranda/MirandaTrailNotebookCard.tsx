import React from 'react';
import type { MirandaTrailFocus } from '../../types/gameAssessment';

type MirandaTrailNotebookCardProps = {
  label: string;
  tag: string;
  text: string;
  trailFocus?: MirandaTrailFocus;
};

function FootprintIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="8" cy="6" rx="3" ry="4" opacity="0.85" />
      <ellipse cx="14" cy="9" rx="2.5" ry="3.5" opacity="0.75" />
      <ellipse cx="10" cy="14" rx="3" ry="4" opacity="0.85" />
      <ellipse cx="16" cy="17" rx="2.5" ry="3.5" opacity="0.75" />
    </svg>
  );
}

function TrailMap({ focus }: { focus: MirandaTrailFocus }) {
  const gymActive = ['gym_footprints', 'lesson_complete'].includes(focus);
  const path1Active = ['gym_footprints', 'footprints_library', 'inference_trail', 'lesson_complete'].includes(focus);
  const footprintsActive = ['gym_footprints', 'footprints_library', 'inference_trail', 'lesson_complete'].includes(focus);
  const libraryActive = ['footprints_library', 'table_clue', 'inference_trail', 'lesson_complete'].includes(focus);
  const pathToTableActive = ['table_clue', 'inference_trail', 'lesson_complete'].includes(focus);
  const tableActive = ['table_clue', 'lesson_complete'].includes(focus);
  const showMiranda = focus === 'character_miranda' || focus === 'inference_trail';
  const showObservation = focus === 'observation_skill';
  const showPrediction = focus === 'prediction_next';
  const showFlame = focus === 'lesson_complete';

  return (
    <div className="miranda-trailMap" role="img" aria-label="Investigation trail from gym to library to hidden clue">
      <div className={`miranda-trailStop${gymActive ? ' miranda-trailStop--active' : ''}`}>
        <span className="miranda-trailStopIcon miranda-trailStopIcon--gym" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <rect x="6" y="10" width="20" height="16" rx="2" fill="currentColor" fillOpacity="0.2" />
            <path d="M10 14h12M10 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 10V6M12 6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <span className="miranda-trailStopLabel">Gym</span>
      </div>

      <div className={`miranda-trailSegment${path1Active ? ' miranda-trailSegment--active' : ''}`} aria-hidden="true">
        <span className="miranda-trailDots" />
        {footprintsActive ? (
          <span className="miranda-trailFootprints">
            <FootprintIcon className="miranda-trailFootprint miranda-trailFootprint--a" />
            <FootprintIcon className="miranda-trailFootprint miranda-trailFootprint--b" />
          </span>
        ) : null}
      </div>

      <div className={`miranda-trailStop${libraryActive ? ' miranda-trailStop--active' : ''}`}>
        <span className="miranda-trailStopIcon miranda-trailStopIcon--library" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <rect x="8" y="8" width="7" height="18" rx="1.5" fill="currentColor" fillOpacity="0.25" />
            <rect x="17" y="8" width="7" height="18" rx="1.5" fill="currentColor" fillOpacity="0.35" />
            <path d="M8 14h7M17 14h7M8 20h7M17 20h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <span className="miranda-trailStopLabel">Library</span>
      </div>

      <div className={`miranda-trailSegment${pathToTableActive ? ' miranda-trailSegment--active' : ''}`} aria-hidden="true">
        <span className="miranda-trailDots" />
      </div>

      <div className={`miranda-trailStop miranda-trailStop--table${tableActive ? ' miranda-trailStop--active' : ''}`}>
        <span className="miranda-trailStopIcon miranda-trailStopIcon--table" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <rect x="5" y="12" width="22" height="4" rx="1" fill="currentColor" fillOpacity="0.35" />
            <path d="M8 16v8M24 16v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect
              x="10"
              y="20"
              width="12"
              height="7"
              rx="1"
              fill="#fde68a"
              stroke="#c9a44a"
              strokeWidth="1.5"
              transform="rotate(-3 16 23.5)"
            />
            <path d="M12 22h8" stroke="#7c5cbf" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </span>
        <span className="miranda-trailStopLabel">Table Clue</span>
        {tableActive ? <span className="miranda-trailTape" aria-hidden="true" /> : null}
      </div>

      {showMiranda ? (
        <span className="miranda-trailOverlay miranda-trailOverlay--miranda" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="12" r="5" fill="currentColor" fillOpacity="0.25" />
            <path d="M8 28c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect x="20" y="18" width="8" height="10" rx="1" fill="currentColor" fillOpacity="0.2" />
          </svg>
        </span>
      ) : null}

      {showObservation ? (
        <span className="miranda-trailOverlay miranda-trailOverlay--observe" aria-hidden="true">
          <span className="miranda-trailBadge">Observation</span>
        </span>
      ) : null}

      {showPrediction ? (
        <span className="miranda-trailOverlay miranda-trailOverlay--predict" aria-hidden="true">
          ?
        </span>
      ) : null}

      {showFlame ? (
        <span className="miranda-trailOverlay miranda-trailOverlay--flame" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4c1.5 3 4 5 4 8a4 4 0 1 1-8 0c0-3 2.5-5 4-8Z"
              fill="#e5c06a"
            />
          </svg>
        </span>
      ) : null}
    </div>
  );
}

export default function MirandaTrailNotebookCard({
  label,
  tag,
  text,
  trailFocus = 'gym_footprints',
}: MirandaTrailNotebookCardProps) {
  return (
    <article className="miranda-trailNotebook" aria-label={`${label}: ${tag}`}>
      <div className="miranda-trailNotebookSpine" aria-hidden="true" />
      <div className="miranda-trailNotebookPage">
        <span className="miranda-trailNotebookStamp" aria-hidden="true">
          TRAIL
        </span>
        <p className="miranda-clueLabel">{label}</p>
        <span className="miranda-clueTag miranda-clueTag--trail">{tag}</span>
        <TrailMap focus={trailFocus} />
        <p className="miranda-trailPrompt">&ldquo;{text}&rdquo;</p>
      </div>
    </article>
  );
}
