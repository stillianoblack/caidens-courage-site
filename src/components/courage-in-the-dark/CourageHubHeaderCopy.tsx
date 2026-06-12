import React from 'react';

type CourageHubHeaderCopyProps = {
  week: number;
  weekTitle: string;
  selFocus?: string;
  variant?: 'overlay' | 'mobile';
};

export default function CourageHubHeaderCopy({
  week,
  weekTitle,
  selFocus,
  variant = 'overlay',
}: CourageHubHeaderCopyProps) {
  return (
    <div
      className={[
        'courageHubHeaderCopy',
        variant === 'mobile' ? 'courageHubHeaderCopy--mobile' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="courageMapCanvasEyebrow">Week {week}</p>
      <h2 className="courageMapCanvasTitle">{weekTitle}</h2>
      <p className="courageMapCanvasSubtitle">Choose your adventure.</p>
      {selFocus ? <p className="courageMapCanvasSelFocus">SEL Focus: {selFocus}</p> : null}
    </div>
  );
}
