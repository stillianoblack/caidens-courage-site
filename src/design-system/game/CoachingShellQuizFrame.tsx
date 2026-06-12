import React from 'react';
import GameCoachingRailAside from '../narration/GameCoachingRailAside';

export type CoachingShellQuizFrameProps = {
  scenario?: React.ReactNode;
  question: React.ReactNode;
  answers: React.ReactNode;
  coachRail: React.ReactNode;
  readAloudSegments?: string[];
  readAloudResetKey?: string;
  className?: string;
};

/** Two-column coaching quiz layout — scenario + answers left, coach rail right. */
export default function CoachingShellQuizFrame({
  scenario,
  question,
  answers,
  coachRail,
  readAloudSegments = [],
  readAloudResetKey,
  className = '',
}: CoachingShellQuizFrameProps) {
  return (
    <div
      className={[
        'bbc-quizWrap',
        'game-quizWrap',
        'mission-quizLayout',
        'mission-quizLayout--coachingRail',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mission-quizLayoutLearning">
        {scenario ? <div className="mission-quizLayoutScenario">{scenario}</div> : null}
        {question}
        <div className="mission-quizLayoutAnswers">{answers}</div>
      </div>
      <aside className="mission-quizLayoutAside">
        <GameCoachingRailAside
          coachContent={coachRail}
          readAloudSegments={readAloudSegments}
          readAloudResetKey={readAloudResetKey}
        />
      </aside>
    </div>
  );
}
