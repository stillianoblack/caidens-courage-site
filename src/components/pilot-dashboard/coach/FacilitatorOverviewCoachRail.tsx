import React from 'react';
import FacilitatorProgramCoachPanel from './FacilitatorProgramCoachPanel';
import { useFacilitatorOverviewData } from './FacilitatorOverviewCoachProvider';

export default function FacilitatorOverviewCoachRail() {
  const context = useFacilitatorOverviewData();
  if (!context || context.coachPlacement !== 'rail') return null;

  return (
    <div className="portal-rightRailCoach portal-rightRailCoach--rail">
      <FacilitatorProgramCoachPanel model={context.coachModel} loading={context.loading} />
    </div>
  );
}
