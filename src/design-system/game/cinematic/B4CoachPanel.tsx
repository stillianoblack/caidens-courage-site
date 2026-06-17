import React from 'react';

type B4CoachPanelProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * Right column — single glass surface for B-4 coaching rail.
 *
 * TODO(floatingHud): Prep anchor for future floating HUD mode — circular B-4 icon,
 * Read Aloud speaker chip, and player/badge bubble with expandable popover cards.
 * Do not remove this panel until floating HUD ships behind a feature flag.
 */
export default function B4CoachPanel({ children, style }: B4CoachPanelProps) {
  return (
    <aside className="cinematicB4CoachPanel" aria-label="Coach guidance" style={style}>
      {children}
    </aside>
  );
}
