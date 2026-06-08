import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PersonaMarketingPage from '../components/courage/PersonaMarketingPage';
import Button from '../components/ui/Button';
import { SCHOOLS_PAGE } from '../config/personaPages';
import { BRAVE_MIND_CLUB_PATH, BMC_RESET_TOOLS_PATH } from '../config/courageRoutes';
import {
  trackContactFormStarted,
  trackContactFormSubmitted,
  trackSalesFunnel,
} from '../lib/analytics';

const PILOT_IMAGE = '/images/camp-courage/stackworksheets.webp';

const PILOT_RECEIVE = [
  'Guided SEL activities for ages 7–12',
  'Printable classroom resources',
  'Facilitator support materials',
  'Flexible implementation options',
] as const;

const TEACHER_RESOURCES = [
  'Printable activities',
  'SEL discussion questions',
  'Focus reset tools',
  'Reflection prompts',
  'Facilitator guide',
] as const;

function PersonaContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`cc-courage-header-shell sm:px-6 lg:px-8 ${className}`.trim()}>
      <div className="cc-site-container mx-auto">{children}</div>
    </div>
  );
}

function PilotRequestForm({ idPrefix = 'schools-pilot' }: { idPrefix?: string }) {
  const navigate = useNavigate();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        trackContactFormSubmitted('/schools#pilot');
        trackSalesFunnel('pilot_interest_clicked', { source_page: '/schools#pilot' });
        navigate('/contact?subject=Caiden%27s%20Courage%20for%20Schools%20Pilot');
      }}
    >
      {(['Name', 'Email', 'Organization', 'Role'] as const).map((label) => (
        <div key={label}>
          <label htmlFor={`${idPrefix}-${label.toLowerCase()}`} className="block text-sm font-semibold text-navy-600">
            {label}
          </label>
          <input
            id={`${idPrefix}-${label.toLowerCase()}`}
            type={label === 'Email' ? 'email' : 'text'}
            name={label.toLowerCase()}
            className="mt-1.5 h-12 w-full rounded-xl border border-navy-200 px-4 text-navy-600 focus:border-golden-500 focus:outline-none focus:ring-2 focus:ring-golden-500/30"
            placeholder={label === 'Email' ? 'you@school.org' : undefined}
            onFocus={() => trackContactFormStarted('/schools#pilot')}
          />
        </div>
      ))}
      <div>
        <label htmlFor={`${idPrefix}-message`} className="block text-sm font-semibold text-navy-600">
          Message
        </label>
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          rows={4}
          className="mt-1.5 w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-600 focus:border-golden-500 focus:outline-none focus:ring-2 focus:ring-golden-500/30"
          placeholder="Tell us about your school, camp, or program…"
        />
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
        Request Pilot Information
      </Button>
      <p className="text-sm text-navy-500">
        Or email us at{' '}
        <a href="mailto:stills@caidenscourage.com" className="font-semibold text-navy-700 underline">
          stills@caidenscourage.com
        </a>
      </p>
    </form>
  );
}

export default function SchoolsPage() {
  return (
    <PersonaMarketingPage config={SCHOOLS_PAGE}>
      {/* Pilot enrollment — preserved for legacy #pilot links */}
      <section id="pilot" className="cc-schools-section cc-schools-section--large scroll-mt-24 bg-white">
        <PersonaContainer>
          <div className="cc-schools-section-heading">
            <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">
              Now Enrolling Classroom &amp; Community Pilots
            </h2>
            <p className="mt-4 text-base text-navy-600 sm:text-lg lg:text-xl">
              Bring Focus Flame Academy to your school, classroom, counseling group, camp, or youth program with guided
              SEL experiences and story-powered learning tools.
            </p>
          </div>

          <div className="cc-schools-pilot-form-layout">
            <div className="min-w-0">
              <h3 className="font-display text-xl font-bold text-navy-500 sm:text-2xl">What you&apos;ll receive</h3>
              <ul className="mt-6 space-y-3">
                {PILOT_RECEIVE.map((item) => (
                  <li key={item} className="flex gap-3 text-base text-navy-600 sm:text-lg">
                    <span className="mt-1 shrink-0 text-golden-600" aria-hidden>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <figure className="mt-8 max-w-xs">
                <img
                  src={PILOT_IMAGE}
                  alt="Printable Caiden's Courage classroom SEL worksheets"
                  className="block h-auto w-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            </div>
            <div className="cc-schools-pilot-form-panel">
              <PilotRequestForm />
            </div>
          </div>
        </PersonaContainer>
      </section>

      {/* Teacher resources — preserved for legacy #teacher-resources links */}
      <section id="teacher-resources" className="cc-schools-section scroll-mt-24 border-y border-navy-100/80 bg-white">
        <PersonaContainer>
          <div className="cc-schools-section-heading">
            <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">Teacher resources</h2>
            <p className="mt-4 text-base text-navy-600 sm:text-lg lg:text-xl">
              Ready-to-use tools for classrooms, counseling groups, and small-group facilitation.
            </p>
          </div>
          <ul className="cc-schools-card-grid mt-8">
            {TEACHER_RESOURCES.map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-cream px-6 py-5 text-base text-navy-600 sm:text-lg">
                <span className="text-golden-600" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button variant="primary" size="lg" as={Link} to={`${BRAVE_MIND_CLUB_PATH}?type=teacher-pack`}>
              Browse printable resources
            </Button>
            <Button variant="secondary" size="lg" as={Link} to="/teachers">
              View Teacher Portal offer
            </Button>
            <Button variant="secondary" size="lg" as={Link} to={BMC_RESET_TOOLS_PATH}>
              B-4 reset tools
            </Button>
          </div>
        </PersonaContainer>
      </section>

      {/* Training & guides — preserved for legacy #training-guides links */}
      <section id="training-guides" className="cc-schools-section cc-schools-section--compact scroll-mt-24">
        <PersonaContainer>
          <div className="cc-schools-final-cta-inner">
            <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">Training &amp; guides</h2>
            <p className="mt-4 text-base text-navy-600 sm:text-lg lg:text-xl">
              Simple guidance for using Caiden&apos;s Courage tools at home and in the classroom.
            </p>
            <div className="mt-8">
              <Button variant="primary" size="lg" as={Link} to="/training-guides">
                View training &amp; guides
              </Button>
            </div>
          </div>
        </PersonaContainer>
      </section>
    </PersonaMarketingPage>
  );
}
