import React from 'react';
import { useLocation } from 'react-router-dom';
import { PILOT_WEEKLY_JOURNEY, PILOT_WEEKLY_KIT_NOTE } from '../../../data/pilotDashboardContent';
import { useAdultLearningStatus } from '../../../hooks/useAdultLearningStatus';
import AdultLearningStatusBanner from '../../shared/AdultLearningStatusBanner';
import PilotWeekCard from '../PilotWeekCard';
import '../../family-portal/weekly-adventures-unlock-card.css';

export default function PilotWeeklyModulesPanel() {
  const location = useLocation();
  const adultLearningStatus = useAdultLearningStatus(location.pathname);

  return (
    <div className="pilot-panel">
      <p className="pilot-panelIntro">{PILOT_WEEKLY_KIT_NOTE}</p>

      <div className="pilot-weeklyModulesBanner">
        <AdultLearningStatusBanner placement="weekly-modules" status={adultLearningStatus} />
      </div>

      {/* TODO: Replace placeholder links with uploaded PDF module files. */}
      <div className="pilot-dash-weekGrid">
        {PILOT_WEEKLY_JOURNEY.map((week) => (
          <PilotWeekCard key={week.week} week={week} />
        ))}
      </div>
    </div>
  );
}
