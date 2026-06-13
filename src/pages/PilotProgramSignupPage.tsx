import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import PilotProgramSignupForm from '../components/pilot-program/PilotProgramSignupForm';
import '../components/pilot-program/pilot-program.css';
import { applyProgramPortalUnlock } from '../config/portalContext';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import { resolveFamilyKidDefaultLandingPath } from '../lib/familyKidLanding';
import { PILOT_PROGRAM_SIGNUP_PATH, PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import { isIndependentFamilyProgram } from '../lib/independentFamilyProgram';
import { refreshAnalyticsIdentity, trackContactFormSubmitted } from '../lib/analytics';
import { submitPilotProgramSignup } from '../lib/pilotProgramService';
import { replaceWithPortalRoute } from '../lib/portalHardNavigation';
import type { PilotProgramSignupInput } from '../types/pilotProgram';

export default function PilotProgramSignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Pilot Program Signup | Caiden's Courage";
  }, []);

  const handleSubmit = async (input: PilotProgramSignupInput) => {
    setSubmitting(true);
    setError(null);

    const result = await submitPilotProgramSignup(input);

    if (!result.success) {
      setError(result.message);
      setSubmitting(false);
      return;
    }

    const isIndependentFamily = isIndependentFamilyProgram(result.program);

    if (isIndependentFamily) {
      applyProgramPortalUnlock(result.program, 'family', result.program.familyAccessCode);
      writeLastPilotProgram(
        result.program,
        'family',
        input.adminEmail,
        result.program.familyAccessCode,
      );
      refreshAnalyticsIdentity();
      trackContactFormSubmitted(PILOT_PROGRAM_SIGNUP_PATH);
      replaceWithPortalRoute(resolveFamilyKidDefaultLandingPath());
      return;
    }

    const facilitatorCode = result.program.facilitatorAccessCode;
    if (!facilitatorCode) {
      setError('Facilitator access code is missing for this program. Please contact support.');
      setSubmitting(false);
      return;
    }
    applyProgramPortalUnlock(result.program, 'facilitator', facilitatorCode);
    writeLastPilotProgram(result.program, 'facilitator', input.adminEmail, facilitatorCode);
    refreshAnalyticsIdentity();
    trackContactFormSubmitted(PILOT_PROGRAM_SIGNUP_PATH);
    replaceWithPortalRoute(`${PROGRAM_DASHBOARD_PATH}?welcome=1`);
  };

  return (
    <div className="pilotSignup-page flex min-h-screen flex-col">
      <CourageHeader />

      <header className="pilotSignup-hero">
        <h1 className="pilotSignup-heroTitle">Focus Flame Academy Pilot Signup</h1>
        <p className="pilotSignup-heroSub">
          Create a camp, classroom, or independent family account. Get your access codes and start
          using games, assessments, and family-ready resources.
        </p>
      </header>

      <main className="pilotSignup-main">
        <div className="pilotSignup-card">
          <h2 className="pilotSignup-cardTitle">Start Your Pilot Program</h2>
          <p className="pilotSignup-cardSub">
            Tell us about your camp, classroom, homeschool group, or family. We&apos;ll generate your
            codes and open your portal right away.
          </p>

          <PilotProgramSignupForm onSubmit={handleSubmit} submitting={submitting} error={error} />

          <p className="pilotSignup-cardSub" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
            Already have a Blue Ribbon pilot?{' '}
            <Link to="/portal/blueribbon2026">Open Blue Ribbon Dashboard</Link>
          </p>
        </div>
      </main>

      <CourageFooter />
    </div>
  );
}
