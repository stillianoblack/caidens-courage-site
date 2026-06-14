import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { PILOT_WEEKLY_KIT_NOTE } from '../../../data/pilotDashboardContent';
import { useAdultLearningStatus } from '../../../hooks/useAdultLearningStatus';
import { useAdventureModules } from '../../../hooks/useAdventureModules';
import { mergePilotWeeksWithCms } from '../../../lib/adventureWeekAssets';
import AdultLearningStatusBanner from '../../shared/AdultLearningStatusBanner';
import PilotWeekCard from '../PilotWeekCard';
import { PortalPageIntro } from '../../portal-design-system';
import '../../family-portal/weekly-adventures-unlock-card.css';

export default function PilotWeeklyModulesPanel() {
  const location = useLocation();
  const adultLearningStatus = useAdultLearningStatus(location.pathname);
  const { modules } = useAdventureModules('all');
  const weeks = useMemo(() => mergePilotWeeksWithCms(modules), [modules]);

  return (
    <div className="pilot-panel">
      <PortalPageIntro>{PILOT_WEEKLY_KIT_NOTE}</PortalPageIntro>

      <div className="pilot-weeklyModulesBanner">
        <AdultLearningStatusBanner placement="weekly-modules" status={adultLearningStatus} />
      </div>

      <div className="pilot-dash-weekGrid">
        {weeks.map((week) => (
          <PilotWeekCard key={week.week} week={week} />
        ))}
      </div>
    </div>
  );
}
