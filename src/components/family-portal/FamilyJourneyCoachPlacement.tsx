import React from 'react';
import { useFamilyJourneyCoachPlacement } from '../../hooks/useFamilyJourneyCoachPlacement';
import FamilyMissionCoachPanel from './FamilyMissionCoachPanel';

/** B-4 Focus Flame Journey card in the portal right utility rail (desktop). */
export function FamilyJourneyCoachRail() {
  const placement = useFamilyJourneyCoachPlacement();
  if (placement !== 'rail') return null;

  return (
    <div className="portal-rightRailCoach portal-rightRailFamilyJourney">
      <FamilyMissionCoachPanel className="family-missionCoachPanel--b4" />
    </div>
  );
}

/** B-4 Focus Flame Journey — top of Home on tablet/mobile. */
export function FamilyJourneyCoachInline() {
  const placement = useFamilyJourneyCoachPlacement();
  if (placement !== 'inline') return null;

  return (
    <aside className="family-journeyCoachInline family-journeyCoachInline--b4" aria-label="B-4 Focus Flame Journey">
      <FamilyMissionCoachPanel className="family-missionCoachPanel--b4" />
    </aside>
  );
}
