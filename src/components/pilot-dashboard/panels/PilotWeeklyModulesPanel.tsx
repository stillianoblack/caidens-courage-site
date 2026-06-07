import React from 'react';
import { PILOT_WEEKLY_JOURNEY, PILOT_WEEKLY_KIT_NOTE } from '../../../data/pilotDashboardContent';
import PilotWeekCard from '../PilotWeekCard';

export default function PilotWeeklyModulesPanel() {
  return (
    <div className="pilot-panel">
      <p className="pilot-panelIntro">{PILOT_WEEKLY_KIT_NOTE}</p>
      {/* TODO: Replace placeholder links with uploaded PDF module files. */}
      <div className="pilot-dash-weekGrid">
        {PILOT_WEEKLY_JOURNEY.map((week) => (
          <PilotWeekCard key={week.week} week={week} />
        ))}
      </div>
    </div>
  );
}
