import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import PilotProgramSignupForm from '../components/pilot-program/PilotProgramSignupForm';
import '../components/pilot-program/pilot-program.css';
import { applyProgramPortalUnlock } from '../config/portalContext';
import { writeLastPilotProgram } from '../config/lastPilotProgram';
import { resolveFamilyKidDefaultLandingPath } from '../lib/familyKidLanding';
import { activateIndependentFamilyPortalSession } from '../lib/independentFamilyPortalSignup';
import { PILOT_PROGRAM_SIGNUP_PATH, PROGRAM_DASHBOARD_PATH } from '../config/courageRoutes';
import { isIndependentFamilyProgram } from '../lib/independentFamilyProgram';
import { refreshAnalyticsIdentity, trackContactFormSubmitted } from '../lib/analytics';
import { trackKitFacilitatorSignup } from '../lib/kitIntegration';
import { submitPilotProgramSignup } from '../lib/pilotProgramService';
import { replaceWithPortalRoute } from '../lib/portalHardNavigation';
import type { PilotProgramSignupInput } from '../types/pilotProgram';

const SIGNUP_ERROR = {
  title: "We couldn't create your program.",
  body:
    "Your information hasn't been lost. Please try again. If the problem continues, contact hello@caidenscourage.com.",
};

export default function PilotProgramSignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const lastSubmissionRef = useRef<PilotProgramSignupInput | null>(null);
  const [error, setError] = useState<{ title: string; body: string } | null>(null);
  const [signupRequestId] = useState(() =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `family-signup-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  useEffect(() => {
    document.title = "Pilot Program Signup | Caiden's Courage";
  }, []);

  const handleSubmit = async (input: PilotProgramSignupInput) => {
    if (submittingRef.current) return;
    lastSubmissionRef.current = input;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    const step = (name: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.info('[PILOT_SIGNUP_STEP]', { step: name, request_id: signupRequestId });
      }
    };

    try {
      step('request_start');
      const result = await submitPilotProgramSignup(input, { requestId: signupRequestId });

      if (!result.success) {
        step(`request_failed:${result.code}`);
        console.warn('[PILOT_SIGNUP_FAILED]', {
          request_id: signupRequestId,
          correlation_id: result.correlationId || null,
          code: result.code,
        });
        setError(
          result.code === 'validation_error'
            ? { title: 'Check your information.', body: result.message }
            : SIGNUP_ERROR,
        );
        return;
      }

      const isIndependentFamily = isIndependentFamilyProgram(result.program);

      if (isIndependentFamily) {
        step('session_activate');
        activateIndependentFamilyPortalSession({
          program: result.program,
          parentEmail: input.adminEmail,
          accessCode: result.program.familyAccessCode,
          parentLastName: input.adminFirstName,
        });
        refreshAnalyticsIdentity();
        trackContactFormSubmitted(PILOT_PROGRAM_SIGNUP_PATH);
        step('redirect');
        replaceWithPortalRoute(result.redirectDestination || resolveFamilyKidDefaultLandingPath());
        return;
      }

      const facilitatorCode = result.program.facilitatorAccessCode;
      if (!facilitatorCode) {
        console.warn('[PILOT_SIGNUP_FAILED]', {
          request_id: signupRequestId,
          code: 'missing_facilitator_access',
        });
        setError(SIGNUP_ERROR);
        return;
      }
      applyProgramPortalUnlock(result.program, 'facilitator', facilitatorCode);
      writeLastPilotProgram(result.program, 'facilitator', input.adminEmail, facilitatorCode);
      trackKitFacilitatorSignup({
        facilitatorEmail: input.adminEmail,
        eventName: 'facilitator_signup',
        metadata: { program_code: result.program.programCode, source: 'pilot_signup' },
      });
      refreshAnalyticsIdentity();
      trackContactFormSubmitted(PILOT_PROGRAM_SIGNUP_PATH);
      step('redirect');
      replaceWithPortalRoute(result.redirectDestination || `${PROGRAM_DASHBOARD_PATH}?welcome=1`);
    } catch (caught) {
      step('unexpected_error');
      console.warn('[PILOT_SIGNUP_FAILED]', {
        request_id: signupRequestId,
        error: caught instanceof Error ? caught.message : 'unknown_error',
      });
      setError(SIGNUP_ERROR);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (!lastSubmissionRef.current || submittingRef.current) return;
    await handleSubmit(lastSubmissionRef.current);
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

          <PilotProgramSignupForm
            onSubmit={handleSubmit}
            onRetry={handleRetry}
            submitting={submitting}
            error={error}
          />

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
