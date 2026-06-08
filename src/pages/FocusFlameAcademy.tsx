import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import SectionHero from '../components/courage/SectionHero';
import Button from '../components/ui/Button';
import useHashScroll from '../hooks/useHashScroll';

const SEL_PILLARS = ['Focus', 'Feelings', 'Courage', 'Reflection', 'Brave choices'];

const INCLUDED = [
  'Story-based lessons',
  'Interactive Focus Flame Lab',
  'Printable SEL activities',
  'Discussion prompts',
  'Facilitator resources',
  'Group reflection tools',
];

const PILOT_BULLETS = [
  'Designed for ages 7–12',
  'Works for small groups or classrooms',
  'Combines story, play, discussion, and reflection',
  'Flexible for schools, camps, counselors, and homeschool groups',
];

const TEACHER_RESOURCES = [
  'Printable activities',
  'SEL discussion questions',
  'Focus reset tools',
  'Reflection prompts',
  'Facilitator guide',
];

const TESTIMONIALS = [
  'Kids connected with Caiden immediately.',
  'The story opened the door for conversations about focus and emotions.',
  'This feels like something students would actually want to use.',
];

const FocusFlameAcademy: React.FC = () => {
  const navigate = useNavigate();
  useHashScroll();

  useEffect(() => {
    document.title = "Focus Flame Academy | Caiden's Courage";
  }, []);

  return (
    <div className="min-h-screen bg-cream font-body">
      <CourageHeader />

      <SectionHero
        eyebrow="Focus Flame Academy"
        title="Focus Flame Academy"
        description="Story-based SEL tools for schools, districts, camps, counselors, and after-school programs."
      >
        <div className="flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
          <Button variant="primary" size="lg" as={Link} to="/focus-flame-academy#request-information" className="w-full sm:w-auto">
            Request Pilot Information
          </Button>
          <Button
            variant="secondary"
            size="lg"
            as={Link}
            to="/kids"
            className="w-full !border-white/70 !text-white hover:!bg-white/10 sm:w-auto"
          >
            Explore Kids Experience
          </Button>
        </div>
      </SectionHero>

      {/* SEL Framework */}
      <section id="sel-framework" className="scroll-mt-24 border-b border-navy-100/80 bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">SEL Framework</h2>
          <p className="mt-3 max-w-3xl text-base text-navy-600 sm:text-lg">
            Focus Flame Academy helps kids practice social-emotional skills through story, play, and guided reflection.
          </p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {SEL_PILLARS.map((pillar) => (
              <li
                key={pillar}
                className="rounded-full border-2 border-navy-200 bg-cream px-5 py-2.5 font-display text-sm font-bold text-navy-600 sm:text-base"
              >
                {pillar}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What's Included */}
      <section id="whats-included" className="scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">What&apos;s Included</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="rounded-3xl border-2 border-navy-100 bg-white p-5 shadow-sm transition-transform duration-200 md:hover:-translate-y-0.5"
              >
                <span className="font-display text-lg font-bold text-navy-500">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pilot Program */}
      <section id="pilot-program" className="scroll-mt-24 border-y border-navy-100/80 bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">Pilot Program</h2>
          <p className="mt-3 max-w-3xl text-base text-navy-600 sm:text-lg">
            Bring Caiden&apos;s Courage into your school, camp, counseling group, or after-school program as a guided SEL
            experience.
          </p>
          <ul className="mt-6 space-y-3 text-navy-600">
            {PILOT_BULLETS.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-golden-500" aria-hidden />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button variant="primary" size="lg" as={Link} to="/focus-flame-academy#request-information" className="w-full sm:w-auto">
              Request Pilot Information
            </Button>
          </div>
        </div>
      </section>

      {/* Teacher Resources */}
      <section id="teacher-resources" className="scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">Teacher Resources</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {TEACHER_RESOURCES.map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-5 py-4 text-navy-600">
                <span className="text-golden-600" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="scroll-mt-24 border-t border-navy-100/80 bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-golden-700">Early Feedback</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">Early Feedback</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((quote) => (
              <blockquote
                key={quote}
                className="rounded-3xl border-2 border-navy-100 bg-cream p-6 font-display text-lg font-semibold leading-snug text-navy-600"
              >
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Request Information */}
      <section id="request-information" className="scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border-2 border-navy-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">Request Information</h2>
          <p className="mt-3 text-base text-navy-600">
            Interested in bringing Caiden&apos;s Courage to your school, camp, counseling group, or after-school program?
          </p>
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate('/contact?subject=Focus%20Flame%20Academy%20Pilot');
            }}
          >
            {(['Name', 'Email', 'Organization', 'Role'] as const).map((label) => (
              <div key={label}>
                <label htmlFor={`pilot-${label.toLowerCase()}`} className="block text-sm font-semibold text-navy-600">
                  {label}
                </label>
                <input
                  id={`pilot-${label.toLowerCase()}`}
                  type={label === 'Email' ? 'email' : 'text'}
                  name={label.toLowerCase()}
                  className="mt-1.5 h-12 w-full rounded-xl border border-navy-200 px-4 text-navy-600 focus:border-golden-500 focus:outline-none focus:ring-2 focus:ring-golden-500/30"
                  placeholder={label === 'Email' ? 'you@school.org' : undefined}
                />
              </div>
            ))}
            <div>
              <label htmlFor="pilot-message" className="block text-sm font-semibold text-navy-600">
                Message
              </label>
              <textarea
                id="pilot-message"
                name="message"
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-600 focus:border-golden-500 focus:outline-none focus:ring-2 focus:ring-golden-500/30"
                placeholder="Tell us about your program…"
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
        </div>
      </section>

      <CourageFooter />
    </div>
  );
};

export default FocusFlameAcademy;
