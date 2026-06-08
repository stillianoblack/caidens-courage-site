import React from 'react';
import type { UncleTCoachingAccent } from '../../types/gameAssessment';
import { UncleTScenarioIcon } from './AdultTrainingIcon';

type UncleTScenarioIllustrationProps = {
  accent?: UncleTCoachingAccent;
};

/** Recognizable filled icon for Uncle T coaching scenarios. */
export default function UncleTScenarioIllustration({ accent }: UncleTScenarioIllustrationProps) {
  return <UncleTScenarioIcon accent={accent} />;
}
