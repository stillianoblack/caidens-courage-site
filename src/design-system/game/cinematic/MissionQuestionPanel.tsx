import React from 'react';

type MissionQuestionPanelProps = {
  children: React.ReactNode;
  questionKey?: string;
  style?: React.CSSProperties;
};

/** Center column — single glass surface for scenario + answers. */
export default function MissionQuestionPanel({
  children,
  questionKey,
  style,
}: MissionQuestionPanelProps) {
  return (
    <section
      className="cinematicMissionQuestionPanel"
      aria-labelledby="game-question"
      data-question-key={questionKey}
      style={style}
    >
      {children}
    </section>
  );
}
