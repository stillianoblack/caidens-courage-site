import React from 'react';
import type { VictoriaReflectionAccent } from '../../types/gameAssessment';
import { VictoriaReflectionIcon } from './AdultTrainingIcon';

type VictoriaReflectionGraphicProps = {
  accent?: VictoriaReflectionAccent;
};

/** Recognizable filled icon for Dr. Victoria reflection scenarios. */
export default function VictoriaReflectionGraphic({ accent }: VictoriaReflectionGraphicProps) {
  return <VictoriaReflectionIcon accent={accent} />;
}
