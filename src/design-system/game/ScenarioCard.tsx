import React from 'react';
import QuestionCard, { type QuestionCardProps } from './QuestionCard';

export type ScenarioCardProps = QuestionCardProps;

/** Standard gameplay scenario card — character icon + scenario copy. */
export default function ScenarioCard({
  sceneLabel = 'Scenario',
  sceneImageLayout = 'inline',
  className = '',
  ...props
}: ScenarioCardProps) {
  return (
    <QuestionCard
      sceneLabel={sceneLabel}
      sceneImageLayout={sceneImageLayout}
      className={['ds-questionCard--gameScenario', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
