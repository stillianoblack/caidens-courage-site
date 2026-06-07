import React from 'react';
import type { MissionArtworkType } from '../../types/missionBoard';

type MissionPreviewGraphicProps = {
  artworkType: MissionArtworkType;
  className?: string;
};

function PreviewCaseFile() {
  return (
    <div className="mission-preview mission-preview--case-file">
      <span className="mission-previewStamp">EVIDENCE</span>
      <p className="mission-previewLine">&ldquo;Welcome students…&rdquo;</p>
      <span className="mission-previewEmber" aria-hidden="true" />
    </div>
  );
}

function PreviewGrammarBoard() {
  return (
    <div className="mission-preview mission-preview--grammar-board">
      <span className="mission-previewPin" aria-hidden="true" />
      <p className="mission-previewStrip">
        The clue was <span className="mission-previewBlank">_____</span> from the board.
      </p>
    </div>
  );
}

function PreviewMissingLetters() {
  return (
    <div className="mission-preview mission-preview--missing-letters">
      <div className="mission-previewTiles" aria-hidden="true">
        {['A', 'B', 'C'].map((letter) => (
          <span key={letter} className="mission-previewTile">
            {letter}
          </span>
        ))}
      </div>
      <p className="mission-previewWord">
        m<span className="mission-previewUnderline" />ssage
      </p>
    </div>
  );
}

function PreviewContextNotebook() {
  return (
    <div className="mission-preview mission-preview--context-notebook">
      <p className="mission-previewNote">Miranda carefully</p>
      <p className="mission-previewHighlight">
        <span className="mission-previewMagnifier" aria-hidden="true">
          🔍
        </span>
        examined
      </p>
    </div>
  );
}

function PreviewTrailNotebook() {
  return (
    <div className="mission-preview mission-preview--trail-notebook">
      <div className="mission-previewTrail" aria-hidden="true">
        <span>Gym</span>
        <span className="mission-previewTrailDots" />
        <span>Lib</span>
        <span className="mission-previewTrailDots" />
        <span>Clue</span>
      </div>
      <span className="mission-previewFootprints" aria-hidden="true">
        👣
      </span>
    </div>
  );
}

function PreviewFocusQuest() {
  return (
    <div className="mission-preview mission-preview--focus-quest">
      <span className="mission-previewFlame" aria-hidden="true">
        🔥
      </span>
      <p className="mission-previewLine">What comes first?</p>
    </div>
  );
}

function PreviewFocusLocked() {
  return (
    <div className="mission-preview mission-preview--focus-locked">
      <span className="mission-previewLock" aria-hidden="true">
        🔒
      </span>
      <p className="mission-previewLine">Coming soon</p>
    </div>
  );
}

export default function MissionPreviewGraphic({ artworkType, className = '' }: MissionPreviewGraphicProps) {
  const wrapClass = ['mission-previewWrap', className].filter(Boolean).join(' ');

  return (
    <div className={wrapClass} aria-hidden="true">
      {artworkType === 'case-file' ? <PreviewCaseFile /> : null}
      {artworkType === 'grammar-board' ? <PreviewGrammarBoard /> : null}
      {artworkType === 'missing-letters' ? <PreviewMissingLetters /> : null}
      {artworkType === 'context-notebook' ? <PreviewContextNotebook /> : null}
      {artworkType === 'trail-notebook' ? <PreviewTrailNotebook /> : null}
      {artworkType === 'focus-quest' ? <PreviewFocusQuest /> : null}
      {artworkType === 'focus-locked' ? <PreviewFocusLocked /> : null}
    </div>
  );
}
