import React from 'react';
import type { VictoriaFocusLabAccent } from '../../types/gameAssessment';
import { VictoriaFocusLabIcon } from './AdultTrainingIcon';

type VictoriaFocusLabGraphicProps = {
  accent?: VictoriaFocusLabAccent;
};

/** Recognizable filled icon for Dr. Victoria focus lab scenarios. */
export default function VictoriaFocusLabGraphic({ accent }: VictoriaFocusLabGraphicProps) {
  return <VictoriaFocusLabIcon accent={accent} />;
}
