import React from 'react';
import { formatSelFocusLine } from '../../lib/adventureSelFocus';

type CourageHubHeaderCopyProps = {
  week: number;
  weekTitle: string;
  selFocus?: string;
  variant?: 'overlay' | 'mobile';
  trailing?: React.ReactNode;
};

export default function CourageHubHeaderCopy({
  week,
  weekTitle,
  selFocus,
  variant = 'overlay',
  trailing,
}: CourageHubHeaderCopyProps) {
  return (
    <div
      className={[
        'courageHubHeaderCopy',
        variant === 'mobile' ? 'courageHubHeaderCopy--mobile' : '',
        trailing ? 'courageHubHeaderCopy--withTrailing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="courageHubHeaderCopyMain">
        <p className="courageMapCanvasEyebrow">Week {week}</p>
        <h2 className="courageMapCanvasTitle">{weekTitle}</h2>
        <p className="courageMapCanvasSubtitle">Choose your adventure.</p>
        {selFocus ? (
          <p className="courageMapCanvasSelFocus">{formatSelFocusLine(selFocus) ?? selFocus}</p>
        ) : null}
      </div>
      {trailing ? <div className="courageHubHeaderCopyTrailing">{trailing}</div> : null}
    </div>
  );
}
