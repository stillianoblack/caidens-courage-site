import React from 'react';
import { useFamilyJourneyCoachPlacement } from '../../hooks/useFamilyJourneyCoachPlacement';
import FamilyMissionCoachPanel from './FamilyMissionCoachPanel';

/** B-4 Focus Flame Journey card in the portal right utility rail (desktop). */
export function FamilyJourneyCoachRail() {
  const placement = useFamilyJourneyCoachPlacement();
  if (placement !== 'rail') return null;

  return (
    <div className="portal-rightRailCoach portal-rightRailFamilyJourney">
      <FamilyMissionCoachPanel />
    </div>
  );
}

/** B-4 Focus Flame Journey card stacked below dashboard on tablet/mobile. */
export function FamilyJourneyCoachInline() {
  const placement = useFamilyJourneyCoachPlacement();
  if (placement !== 'inline') return null;

  return (
    <aside className="family-journeyCoachInline" aria-label="B-4 Focus Flame Journey">
      <FamilyMissionCoachPanel />
    </aside>
  );
}
