import React from 'react';
import FocusFlameLabShell from '../components/focus-flame-lab/FocusFlameLabShell';
import Week0AssessmentExperience from '../components/focus-flame-lab/week0/Week0AssessmentExperience';
import PublicPilotExperienceGate from '../components/courage/PublicPilotExperienceGate';

export default function Week0AssessmentPage() {
  return (
    <PublicPilotExperienceGate interestType="focus_flame_lab">
      <FocusFlameLabShell ariaLabel="Week 0 Focus Check">
        <Week0AssessmentExperience />
      </FocusFlameLabShell>
    </PublicPilotExperienceGate>
  );
}
