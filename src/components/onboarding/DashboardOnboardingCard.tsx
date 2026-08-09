import React from 'react';
import './dashboard-onboarding-card.css';

export type DashboardOnboardingRole = 'facilitator' | 'family' | 'student';

const CONTENT: Record<DashboardOnboardingRole, { title: string; intro: string; steps: string[] }> = {
  facilitator: {
    title: 'Welcome to Focus Flame Academy',
    intro: 'A few good places to begin:',
    steps: ['Add students', 'Review the first weekly module', 'Complete or assign the baseline assessment', 'Explore training and resources'],
  },
  family: {
    title: 'Welcome to your Family Hub',
    intro: 'Start with one small step:',
    steps: ["View your child’s profile", 'Start the first mission', 'Review progress and rewards'],
  },
  student: {
    title: 'Ready to build your Focus Flame?',
    intro: 'Here are your first adventures:',
    steps: ['Start your first mission', 'Meet or select your B-4', 'Earn your first badge'],
  },
};

type Props = { role: DashboardOnboardingRole; onDismiss: () => void; busy?: boolean };

export default function DashboardOnboardingCard({ role, onDismiss, busy = false }: Props) {
  const copy = CONTENT[role];
  return (
    <section className={`dashboardOnboarding dashboardOnboarding--${role}`} aria-labelledby={`dashboard-onboarding-${role}`}>
      <div className="dashboardOnboarding-copy">
        <h2 id={`dashboard-onboarding-${role}`}>{copy.title}</h2>
        <p>{copy.intro}</p>
        <ul>{copy.steps.map((step) => <li key={step}>{step}</li>)}</ul>
      </div>
      <button type="button" onClick={onDismiss} disabled={busy} aria-label="Dismiss welcome checklist">
        {busy ? 'Saving…' : 'Dismiss'}
      </button>
    </section>
  );
}
