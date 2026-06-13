import React, { useEffect, useState } from 'react';
import { useFamilyJourneyCoachPlacement } from '../../hooks/useFamilyJourneyCoachPlacement';
import { useFamilyOnboardingStatus } from '../../hooks/useFamilyOnboardingStatus';
import { useFamilyMobileNav } from '../../hooks/useFamilyMobileNav';
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

/** B-4 Focus Flame Journey — top of Home on tablet/mobile; collapsible on phone. */
export function FamilyJourneyCoachInline() {
  const placement = useFamilyJourneyCoachPlacement();
  const { isComplete, loading } = useFamilyOnboardingStatus();
  const { isMobileNav } = useFamilyMobileNav();
  const [expanded, setExpanded] = useState(!isComplete);

  useEffect(() => {
    if (!loading) {
      setExpanded(!isComplete);
    }
  }, [isComplete, loading]);

  if (placement !== 'inline') return null;

  if (isMobileNav) {
    return (
      <aside className="family-journeyCoachInline" aria-label="B-4 Focus Flame Journey">
        <div className="family-journeyCoachAccordion">
          <button
            type="button"
            className="family-journeyCoachAccordionToggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
          >
            <span className="family-journeyCoachAccordionTitle">B-4 Focus Flame Journey</span>
            <span className="family-journeyCoachAccordionChevron" aria-hidden="true">
              {expanded ? '▾' : '▸'}
            </span>
          </button>
          {expanded ? (
            <div className="family-journeyCoachAccordionBody">
              <FamilyMissionCoachPanel />
            </div>
          ) : null}
        </div>
      </aside>
    );
  }

  return (
    <aside className="family-journeyCoachInline" aria-label="B-4 Focus Flame Journey">
      <FamilyMissionCoachPanel />
    </aside>
  );
}
