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

function supportCodeFromRequestId(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'SIGNUP';
}

function appendSupportCode(message: string, supportCode?: string): string {
  return supportCode ? `${message} Support code: ${supportCode}.` : message;
}

export default function PilotProgramSignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
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
        setError(
          result.code === 'validation_error'
            ? result.message
            : appendSupportCode(result.message, result.supportCode || supportCodeFromRequestId(signupRequestId)),
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
        setError('Facilitator access code is missing for this program. Please contact support.');
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
      setError(
        `We could not create family access right now. Your information is still here. Please try again. Support code: ${supportCodeFromRequestId(signupRequestId)}.`,
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="pilotSignup-page flex min-h-screen flex-col">
      <CourageHeader />

      <section className="pilotSignup-stage">
        <div className="pilotSignup-heroGlow" aria-hidden="true" />
        <div className="pilotSignup-spark pilotSignup-spark--one" aria-hidden="true" />
        <div className="pilotSignup-spark pilotSignup-spark--two" aria-hidden="true" />
        <header className="pilotSignup-hero">
          <div className="pilotSignup-heroCopy">
            <p className="pilotSignup-eyebrow">Focus Flame Academy <span aria-hidden="true">•</span> Program Setup</p>
            <h1 className="pilotSignup-heroTitle">Start Your Focus Flame Adventure</h1>
            <p className="pilotSignup-heroSub">
              Create your program, invite your explorers, and we&apos;ll help you get everything ready
              for your first adventure.
            </p>
          </div>
          <div className="pilotSignup-heroGuide" aria-hidden="true">
            <div className="pilotSignup-guideHalo" />
            <img
              className="pilotSignup-heroB4"
              src="/images/Choose-Your-Guide/B-4orange-hover.webp"
              alt=""
            />
          </div>
        </header>

        <main className="pilotSignup-main">
          <div className="pilotSignup-card">
          <div className="pilotSignup-cardIntro">
            <img
              className="pilotSignup-cardB4"
              src="/images/Choose-Your-Guide/B-4orange.webp"
              alt=""
              aria-hidden="true"
            />
            <div>
              <h2 className="pilotSignup-cardTitle">Let&apos;s build your program.</h2>
              <p className="pilotSignup-cardSub">
                Tell me a little about your group and I&apos;ll get your Academy ready.
              </p>
            </div>
          </div>

          <ol className="pilotSignup-progress" aria-label="Signup progress">
            <li><span>1</span>Program</li>
            <li><span>2</span>Explorers</li>
            <li><span>3</span>Ready to Go</li>
          </ol>

          <PilotProgramSignupForm onSubmit={handleSubmit} submitting={submitting} error={error} />

          <p className="pilotSignup-cardSub" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
            Already have a Blue Ribbon pilot?{' '}
            <Link to="/portal/blueribbon2026">Open Blue Ribbon Dashboard</Link>
          </p>
          </div>
        </main>
      </section>

      <CourageFooter />
    </div>
  );
}
