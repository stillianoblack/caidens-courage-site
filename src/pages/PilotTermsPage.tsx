import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import '../components/pilot-program/pilot-program.css';
import { PILOT_PROGRAM_SIGNUP_PATH } from '../config/courageRoutes';

export default function PilotTermsPage() {
  useEffect(() => {
    document.title = "Pilot License Terms | Caiden's Courage";
  }, []);

  return (
    <div className="pilotTerms-page flex min-h-screen flex-col">
      <CourageHeader />

      <main className="pilotTerms-main">
        <h1>Focus Flame Academy Pilot License Terms</h1>
        <p className="pilotTerms-intro">
          These terms apply to pilot partners using Focus Flame Academy materials during the pilot
          period. Checking the agreement box during signup constitutes acceptance for MVP pilot
          access.
        </p>

        <section>
          <h2>Program Use Only</h2>
          <p>
            Materials are licensed for use inside the participating program only. They may not be
            resold, posted publicly, or redistributed outside the program.
          </p>
        </section>

        <section>
          <h2>Pilot Development</h2>
          <p>
            Pilot features, games, assessments, and resources may change during development. We may
            add, update, or remove features as the pilot evolves.
          </p>
        </section>

        <section>
          <h2>Student Privacy</h2>
          <p>
            Student data should use nicknames only. Do not enter full legal names, contact
            information, or other personally identifying student details in pilot tools unless
            required by your own program policies and applicable law.
          </p>
        </section>

        <section>
          <h2>Feedback</h2>
          <p>
            The program agrees to provide feedback when possible so we can improve games,
            assessments, family tools, and facilitator resources.
          </p>
        </section>

        <section>
          <h2>Summary</h2>
          <ul>
            <li>Licensed for your enrolled pilot program only.</li>
            <li>No public redistribution or resale.</li>
            <li>Pilot tools may change during development.</li>
            <li>Use student nicknames in pilot activities.</li>
            <li>Share feedback when you can.</li>
          </ul>
        </section>

        <Link to={PILOT_PROGRAM_SIGNUP_PATH} className="pilotTerms-back">
          ← Back to Pilot Signup
        </Link>
      </main>

      <CourageFooter />
    </div>
  );
}
