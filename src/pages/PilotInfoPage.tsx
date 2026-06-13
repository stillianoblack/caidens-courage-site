import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourageHeader from '../components/courage/CourageHeader';
import CourageFooter from '../components/courage/CourageFooter';
import Button from '../components/ui/Button';
import { COURAGE_IN_THE_DARK_BG } from '../data/courageInTheDarkMap';
import { PILOT_PROGRAM_SIGNUP_PATH } from '../config/courageRoutes';

const WHAT_KIDS_DO = [
  {
    title: 'Go on Adventures',
    description: 'Story-powered missions that feel like play, not homework.',
  },
  {
    title: 'Build Focus Skills',
    description: 'Practice attention, planning, and brave choices with Caiden and friends.',
  },
  {
    title: 'Understand Feelings',
    description: 'Name emotions, reset when stuck, and grow confidence step by step.',
  },
  {
    title: 'Earn Rewards',
    description: 'Collect Focus Coins, badges, and stickers as kids progress.',
  },
];

const PEEK_INSIDE = [
  {
    title: 'Adventure Map',
    description: 'Pick missions from a cinematic map and meet each character.',
  },
  {
    title: 'Story-Powered Missions',
    description: 'Interactive scenarios with coaching from B-4 and the team.',
  },
  {
    title: 'Earn & Grow',
    description: 'Track progress, unlock rewards, and celebrate small wins.',
  },
  {
    title: 'B-4 Check-Ins',
    description: 'Quick resets and reflection tools when focus feels hard.',
  },
];

const PILOT_BENEFITS = [
  'Be the first to explore new adventures',
  'Help shape the experience',
  'Support your child’s growth',
];

export default function PilotInfoPage() {
  useEffect(() => {
    document.title = "Focus Flame Adventures | Caiden's Courage";
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <CourageHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-navy-600 text-white">
          <div className="cc-courage-header-shell sm:px-6 lg:px-8">
            <div className="cc-site-container mx-auto grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
              <div>
                <span className="inline-flex rounded-full bg-golden-500/20 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-golden-200">
                  Pilot Access
                </span>
                <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
                  Focus Flame Adventures
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-blue-100">
                  Interactive SEL adventures that help kids build focus, courage, and confidence through
                  story-powered play.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button variant="primary" size="lg" as={Link} to={PILOT_PROGRAM_SIGNUP_PATH} leftIconSrc={null}>
                    Request Access
                  </Button>
                  <p className="text-sm font-semibold text-blue-200">Be among the first to explore.</p>
                </div>
              </div>
              <figure className="relative overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
                <img
                  src={COURAGE_IN_THE_DARK_BG}
                  alt="Courage in the Dark adventure map with Focus Flame characters"
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </figure>
            </div>
          </div>
        </section>

        <section className="border-t border-navy-100/80 bg-white py-14 sm:py-16">
          <div className="cc-courage-header-shell sm:px-6 lg:px-8">
            <div className="cc-site-container mx-auto">
              <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">
                What Kids Will Do
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {WHAT_KIDS_DO.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-3xl border border-navy-100 bg-cream-50 p-6 shadow-sm"
                  >
                    <h3 className="font-display text-lg font-bold text-navy-600">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-navy-600">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-navy-100/80 bg-cream-50 py-14 sm:py-16">
          <div className="cc-courage-header-shell sm:px-6 lg:px-8">
            <div className="cc-site-container mx-auto">
              <h2 className="font-display text-2xl font-extrabold text-navy-500 sm:text-3xl">
                A Peek Inside Focus Flame Lab
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {PEEK_INSIDE.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm"
                  >
                    <h3 className="font-display text-lg font-bold text-navy-600">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-navy-600">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-navy-700 bg-navy-600 py-14 text-white sm:py-16">
          <div className="cc-courage-header-shell sm:px-6 lg:px-8">
            <div className="cc-site-container mx-auto max-w-3xl text-center">
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Join the Pilot</h2>
              <p className="mt-4 text-base leading-relaxed text-blue-100 sm:text-lg">
                Focus Flame Adventures are currently available through select schools, camps, homeschool
                programs, and pilot families.
              </p>
              <ul className="mt-8 space-y-3 text-left sm:mx-auto sm:max-w-md">
                {PILOT_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-base text-blue-50">
                    <span className="mt-1 shrink-0 text-golden-300" aria-hidden>✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button variant="primary" size="lg" as={Link} to={PILOT_PROGRAM_SIGNUP_PATH} leftIconSrc={null}>
                  Request Access
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CourageFooter />
    </div>
  );
}
