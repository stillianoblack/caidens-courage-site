import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FAMILY_MISSION_COACH_COPY } from '../../data/familyMissionCoachContent';
import { useFamilyOnboardingStatus } from '../../hooks/useFamilyOnboardingStatus';
import { familySettingsTabPath } from '../../lib/familyPortalPaths';
export default function FamilyOnboardingMobileCard() {
  const location = useLocation();
  const { isComplete, loading, progressPercent } = useFamilyOnboardingStatus();

  if (loading || isComplete) {
    return null;
  }

  const settingsOverviewPath = familySettingsTabPath('overview', location.pathname);

  return (
    <section className="family-onboardingMobileCard" aria-labelledby="family-onboarding-mobile-title">
      <div className="family-onboardingMobileCardCopy">
        <h2 id="family-onboarding-mobile-title" className="family-onboardingMobileCardTitle">
          {FAMILY_MISSION_COACH_COPY.mobileTitle}
        </h2>
        <p className="family-onboardingMobileCardProgress">
          {Math.round(progressPercent)}% complete · {FAMILY_MISSION_COACH_COPY.progressLabel}
        </p>
      </div>
      <Link to={settingsOverviewPath} className="family-onboardingMobileCardCta">
        {FAMILY_MISSION_COACH_COPY.mobileCta}
      </Link>
    </section>
  );
}
