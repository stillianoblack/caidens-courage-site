import React from 'react';
import DashboardOnboardingCard from '../onboarding/DashboardOnboardingCard';
import { useStudentDashboardOnboarding } from '../../hooks/useDashboardOnboarding';
import MilestoneCelebration from '../learning/MilestoneCelebration';
import './kid-play-shell.css';

type KidPlayShellPageProps = {
  children: React.ReactNode;
  className?: string;
};

/** Shared max-width, gutters, and bottom-nav clearance for kid play shell pages. */
export default function KidPlayShellPage({ children, className }: KidPlayShellPageProps) {
  const onboarding = useStudentDashboardOnboarding();
  return (
    <div className={['kidPlayShellPage', className].filter(Boolean).join(' ')}>
      {onboarding.visible ? (
        <DashboardOnboardingCard
          role="student"
          busy={onboarding.saving}
          onDismiss={() => void onboarding.dismiss()}
        />
      ) : null}
      {children}
      <MilestoneCelebration />
    </div>
  );
}
