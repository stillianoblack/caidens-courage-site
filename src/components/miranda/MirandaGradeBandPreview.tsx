import React from 'react';
import { MIRANDA_GRADE_BAND_LABELS, type MirandaGradeBandKey } from '../../types/mirandaAdaptiveQuest';
import './miranda-grade-band-preview.css';

type MirandaGradeBandPreviewProps = {
  bandKey: MirandaGradeBandKey;
  className?: string;
};

/** Facilitator/admin preview pill — never shown to child gameplay by default */
export default function MirandaGradeBandPreview({
  bandKey,
  className = '',
}: MirandaGradeBandPreviewProps) {
  return (
    <div
      className={['miranda-gradeBandPreview', className].filter(Boolean).join(' ')}
      role="status"
      aria-label={`Previewing ${MIRANDA_GRADE_BAND_LABELS[bandKey]} content`}
    >
      <span className="miranda-gradeBandPreview-label">Preview</span>
      <span className="miranda-gradeBandPreview-pill">{MIRANDA_GRADE_BAND_LABELS[bandKey]}</span>
    </div>
  );
}
