import React from 'react';

type CinematicMissionCoachPanelProps = {
  children: React.ReactNode;
};

/** Right rail — B-4 / facilitator coaching companion. */
export default function CinematicMissionCoachPanel({ children }: CinematicMissionCoachPanelProps) {
  return (
    <aside className="cinematicMissionCoachPanel" aria-label="Coach guidance">
      <div className="cinematicMissionCoachPanelInner">{children}</div>
    </aside>
  );
}
