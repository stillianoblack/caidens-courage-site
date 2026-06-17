import React from 'react';

type CinematicMissionGameplayPanelProps = {
  children: React.ReactNode;
  questionKey?: string;
};

/** Center column — dark glass gameplay surface for scenario + answers. */
export default function CinematicMissionGameplayPanel({
  children,
  questionKey,
}: CinematicMissionGameplayPanelProps) {
  return (
    <section
      className="cinematicMissionGameplayPanel"
      aria-labelledby="game-question"
      data-question-key={questionKey}
    >
      <div className="cinematicMissionGameplayPanelInner">{children}</div>
    </section>
  );
}
