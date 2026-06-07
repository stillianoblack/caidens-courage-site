import React from 'react';
import FocusFlameLabShell from '../components/focus-flame-lab/FocusFlameLabShell';
import Week0AssessmentExperience from '../components/focus-flame-lab/week0/Week0AssessmentExperience';

export default function Week0AssessmentPage() {
  return (
    <FocusFlameLabShell ariaLabel="Week 0 Focus Check">
      <Week0AssessmentExperience />
    </FocusFlameLabShell>
  );
}
