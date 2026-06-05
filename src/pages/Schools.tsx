import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import Button from '../components/ui/Button';
import useHashScroll from '../hooks/useHashScroll';
import { PORTAL_PATH } from '../config/courageNav';
import { schoolsHref } from '../config/schoolsPaths';

const HERO_IMAGE = '/images/caidenscourage/schooldistrict/header_schooldistrict.webp';
const PILOT_IMAGE = '/images/camp-courage/stackworksheets.webp';

const HERO_TRUST_INDICATORS = [
  'Ages 7–12',
  'Graphic Novel + Interactive Activities',
  'Built for Classrooms, Camps & Counseling Groups',
  'Pilot Program Available',
] as const;

const PILOT_RECEIVE = [
  'Guided SEL activities for ages 7–12',
  'Printable classroom resources',
  'Facilitator support materials',
  'Flexible implementation options',
] as const;

type WhyPartnerAccent = 'blue' | 'orange' | 'teal' | 'yellow';

const WHY_PARTNER_ROWS: {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  accent: WhyPartnerAccent;
}[] = [
  {
    title: 'Engage Students Through Story-Powered SEL',
    body: 'Students connect with Caiden, B-4, and the Focus Flame journey while practicing real-world social-emotional skills through story and discussion.',
    imageSrc: '/images/caidenscourage/schooldistrict/1_SEL.webp',
    imageAlt: 'Student engaging with Caiden story-powered SEL',
    accent: 'blue',
  },
  {
    title: 'Support Teachers with Ready-to-Use Tools',
    body: 'Printable activities, discussion guides, reflection prompts, and facilitator resources make implementation simple.',
    imageSrc: '/images/caidenscourage/schooldistrict/teacher.webp',
    imageAlt: 'Printable classroom SEL worksheets and teacher tools',
    accent: 'orange',
  },
  {
    title: 'Practice Focus Through Interactive Play',
    body: 'Focus Flame Lab helps students identify feelings, make choices, and strengthen self-regulation through guided story experiences.',
    imageSrc: '/images/caidenscourage/schooldistrict/interactive.webp',
    imageAlt: 'Focus Flame Lab interactive reflection activity',
    accent: 'teal',
  },
  {
    title: 'Flexible for Classrooms, Camps, and Counseling Groups',
    body: 'Use Caiden\'s Courage in classrooms, small groups, after-school programs, camps, or youth development settings.',
    imageSrc: '/images/caidenscourage/schooldistrict/camps.webp',
    imageAlt: 'Kids participating in a group SEL activity',
    accent: 'yellow',
  },
  {
    title: 'Built for Meaningful Growth',
    body: 'Reflection activities and discussion tools help educators observe growth in confidence, focus, participation, and emotional awareness.',
    imageSrc: '/images/caidenscourage/schooldistrict/growth.webp',
    imageAlt: 'Classroom reflection and growth tools collage',
    accent: 'blue',
  },
];

const WHATS_INCLUDED = [
  '139-page digital graphic novel',
  'Focus Flame Lab',
  'Printable SEL activities',
  'Discussion prompts',
  'Facilitator guide',
  'Group reflection tools',
  'Student reflection activities',
  'Optional portal access',
] as const;

const IMPACT_CARDS = [
  {
    title: 'Focus',
    body: 'Helping students pause, notice distractions, and return to the task.',
  },
  {
    title: 'Feelings',
    body: 'Helping students name emotions and understand body signals.',
  },
  {
    title: 'Courage',
    body: 'Helping students take brave steps, ask for help, and try again.',
  },
] as const;

const WHO_ITS_FOR = [
  'Classrooms',
  'School counselors',
  'Camps',
  'After-school programs',
  'Homeschool groups',
  'Youth organizations',
] as const;

const TEACHER_RESOURCES = [
  'Printable activities',
  'SEL discussion questions',
  'Focus reset tools',
  'Reflection prompts',
  'Facilitator guide',
] as const;

const PILOT_OPTIONS = [
  {
    title: 'Classroom Pilot',
    body: 'For one teacher, classroom, or small group.',
    cta: 'Request Classroom Pilot',
    subject: 'Classroom Pilot',
  },
  {
    title: 'School Pilot',
    body: 'For school-wide or grade-level implementation.',
    cta: 'Request School Pilot',
    subject: 'School Pilot',
  },
  {
    title: 'District / Community Partner',
    body: 'For districts, camps, nonprofits, and youth programs.',
    cta: 'Request Partner Info',
    subject: 'District or Community Partner',
  },
] as const;

/**
 * Exact same shell + site container as CourageHeader / Home:
 * cc-courage-header-shell (gutters) → cc-site-container (80rem / 1280px max).
 */
function SchoolsContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`cc-courage-header-shell sm:px-6 lg:px-8 ${className}`.trim()}>
      <div className="cc-site-container mx-auto">{children}</div>
    </div>
  );
}

function PilotRequestForm({ idPrefix = 'schools-pilot' }: { idPrefix?: string }) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = '/contact?subject=Caiden%27s%20Courage%20for%20Schools%20Pilot';
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

const Schools: React.FC = () => {
  useHashScroll();

  useEffect(() => {
    document.title = "Caiden's Courage for Schools";
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-body">
      <CourageHeader />

      {/* Hero */}
      <section className="cc-schools-hero relative overflow-hidden text-white" data-section="header">
        <div className="cc-section-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="cc-section-hero-noise pointer-events-none absolute inset-0" aria-hidden="true" />
        <SchoolsContainer className="cc-schools-hero-inner relative z-10">
          <div className="cc-schools-hero-grid">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-golden-400 sm:text-[11px]">
                Caiden&apos;s Courage for Schools
              </p>
              <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.08] text-white sm:mt-5 sm:text-4xl lg:text-[3.25rem]">
                Build Focus, Confidence, and Courage in Every Classroom
              </h1>
              <p className="mt-5 text-base leading-relaxed text-white/[0.85] sm:text-lg lg:text-xl">
                A story-powered SEL experience that helps students build focus, confidence, and courage through graphic
                novels, interactive activities, guided reflection, and printable classroom tools.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button variant="primary" size="lg" as={Link} to={schoolsHref('pilot')} className="w-full sm:w-auto">
                  Request Pilot Information
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  as={Link}
                  to={schoolsHref('teacher-resources')}
                  className="cc-schools-hero-secondary w-full sm:w-auto"
                >
                  Explore Teacher Resources
                </Button>
              </div>
              <ul className="cc-schools-hero-trust flex flex-col gap-2.5">
                {HERO_TRUST_INDICATORS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-snug text-white/90 sm:text-[0.9375rem]">
                    <span className="mt-0.5 shrink-0 text-golden-400" aria-hidden>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <figure className="cc-schools-hero-visual mx-auto w-full lg:mx-0">
              <img
                src={HERO_IMAGE}
                alt="Students learning together in a classroom setting"
                className="cc-schools-hero-image"
                loading="eager"
                decoding="async"
              />
            </figure>
          </div>
        </SchoolsContainer>
      </section>

      {/* Why partner — primary sales section */}
      <section id="why-partner" className="cc-schools-section cc-schools-section--large cc-schools-why-partner scroll-mt-24 border-b border-navy-100/80 bg-white">
        <SchoolsContainer>
          <div className="cc-schools-section-heading">
            <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">
              Why partner with Caiden&apos;s Courage?
            </h2>
            <p className="mt-4 text-base text-navy-600 sm:text-lg lg:text-xl">
              We help kids practice emotional awareness, focus, and brave choices through stories, games, and guided
              reflection.
            </p>
          </div>
          <div className="cc-schools-feature-rows">
            {WHY_PARTNER_ROWS.map((row, index) => (
              <article
                key={row.title}
                className={`cc-schools-feature-row ${index % 2 === 1 ? 'cc-schools-feature-row--reverse' : ''}`}
              >
                <div className="cc-schools-feature-copy min-w-0">
                  <h3 className="font-display text-xl font-bold text-navy-500 sm:text-2xl lg:text-[1.75rem]">{row.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-navy-600 sm:text-lg">{row.body}</p>
                </div>
                <figure className={`cc-schools-feature-visual cc-schools-feature-visual--${row.accent} min-w-0`}>
                  <img src={row.imageSrc} alt={row.imageAlt} loading="lazy" decoding="async" />
                </figure>
              </article>
            ))}
          </div>
        </SchoolsContainer>
      </section>

      {/* What's included */}
      <section id="whats-included" className="cc-schools-section scroll-mt-24 border-y border-navy-100/80 bg-white">
        <SchoolsContainer>
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">What&apos;s included</h2>
          <ul className="cc-schools-included-grid">
            {WHATS_INCLUDED.map((item) => (
              <li
                key={item}
                className="rounded-3xl border-2 border-navy-100 bg-cream p-6 shadow-sm transition-transform duration-200 md:hover:-translate-y-0.5"
              >
                <span className="font-display text-base font-bold text-navy-500 sm:text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </SchoolsContainer>
      </section>

      {/* Built for impact */}
      <section id="built-for-impact" className="cc-schools-section scroll-mt-24 border-b border-navy-100/80">
        <SchoolsContainer>
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">
            Built for focus, confidence, and courage
          </h2>
          <div className="cc-schools-card-grid">
            {IMPACT_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border-2 border-navy-100 bg-white p-8 shadow-sm transition-transform duration-200 md:hover:-translate-y-0.5"
              >
                <h3 className="font-display text-xl font-bold text-navy-500 sm:text-2xl">{card.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-navy-600 sm:text-lg">{card.body}</p>
              </div>
            ))}
          </div>
        </SchoolsContainer>
      </section>

      {/* Pilot enrollment — after value sections */}
      <section id="pilot" className="cc-schools-section cc-schools-section--large scroll-mt-24 bg-white">
        <SchoolsContainer>
          <div className="cc-schools-section-heading">
            <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">
              Now Enrolling Classroom &amp; Community Pilots
            </h2>
            <p className="mt-4 text-base text-navy-600 sm:text-lg lg:text-xl">
              Bring Caiden&apos;s Courage to your school, classroom, counseling group, camp, or youth program with
              guided SEL experiences and story-powered learning tools.
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
        </SchoolsContainer>
      </section>

      {/* Who it's for */}
      <section id="who-its-for" className="cc-schools-section scroll-mt-24 border-t border-navy-100/80 bg-white">
        <SchoolsContainer>
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">Who it&apos;s for</h2>
          <ul className="cc-schools-card-grid">
            {WHO_ITS_FOR.map((item) => (
              <li
                key={item}
                className="flex min-h-[88px] items-center gap-4 rounded-2xl border border-navy-100 bg-cream px-6 py-5 font-display text-lg font-semibold text-navy-500 sm:text-xl"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-golden-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </SchoolsContainer>
      </section>

      {/* Pilot options */}
      <section id="pilot-options" className="cc-schools-section scroll-mt-24">
        <SchoolsContainer>
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">Choose the right pilot path</h2>
          <div className="cc-schools-card-grid">
            {PILOT_OPTIONS.map((option) => (
              <div
                key={option.title}
                className="flex flex-col rounded-3xl border-2 border-navy-100 bg-white p-8 shadow-sm"
              >
                <h3 className="font-display text-xl font-bold text-navy-500 sm:text-2xl">{option.title}</h3>
                <p className="mt-4 flex-grow text-base leading-relaxed text-navy-600 sm:text-lg">{option.body}</p>
                <Button
                  variant="primary"
                  size="md"
                  as="a"
                  href={`/contact?subject=${encodeURIComponent(option.subject)}`}
                  leftIconSrc={null}
                  className="mt-8 w-full"
                >
                  {option.cta}
                </Button>
              </div>
            ))}
          </div>
        </SchoolsContainer>
      </section>

      {/* Teacher resources */}
      <section id="teacher-resources" className="cc-schools-section scroll-mt-24 border-y border-navy-100/80 bg-white">
        <SchoolsContainer>
          <div className="cc-schools-section-heading">
            <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl lg:text-4xl">Teacher resources</h2>
            <p className="mt-4 text-base text-navy-600 sm:text-lg lg:text-xl">
              Ready-to-use tools for classrooms, counseling groups, and small-group facilitation.
            </p>
          </div>
          <ul className="cc-schools-card-grid">
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
            <Button variant="primary" size="lg" as={Link} to="/braveminds?type=teacher-pack">
              Browse printable resources
            </Button>
            <Button variant="secondary" size="lg" as={Link} to="/b4-tools">
              B-4 reset tools
            </Button>
          </div>
        </SchoolsContainer>
      </section>

      {/* Training & guides */}
      <section id="training-guides" className="cc-schools-section cc-schools-section--compact scroll-mt-24">
        <SchoolsContainer>
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
        </SchoolsContainer>
      </section>

      {/* Final CTA */}
      <section id="final-cta" className="cc-schools-section cc-schools-section--large scroll-mt-24 border-t border-navy-100/80 bg-navy-500 text-white">
        <SchoolsContainer>
          <div className="cc-schools-final-cta-inner">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl lg:text-4xl">Bring Caiden&apos;s Courage to your community</h2>
            <p className="mt-4 text-base text-white/85 sm:text-lg lg:text-xl">
              Start with a classroom pilot, teacher toolkit, or school partnership.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
              <Button variant="primary" size="lg" as={Link} to={schoolsHref('pilot')} className="w-full sm:w-auto">
                Request Pilot Information
              </Button>
              <Button
                variant="secondary"
                size="lg"
                as={Link}
                to={PORTAL_PATH}
                className="cc-schools-final-portal-cta w-full sm:w-auto"
              >
                Explore the Portal
              </Button>
            </div>
          </div>
        </SchoolsContainer>
      </section>

      <CourageFooter />
    </div>
  );
};

export default Schools;
