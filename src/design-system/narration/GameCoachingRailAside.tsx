import React from 'react';
import ReadAloudControl from './ReadAloudControl';

export type GameCoachingRailAsideProps = {
  coachContent: React.ReactNode;
  readAloudSegments?: string[];
  readAloudResetKey?: string;
  readAloudPlayAriaLabel?: string;
  asideInnerRef?: React.Ref<HTMLDivElement>;
  showReadAloud?: boolean;
};

/** Right coaching column — coach card plus read-aloud beneath it. */
export default function GameCoachingRailAside({
  coachContent,
  readAloudSegments = [],
  readAloudResetKey,
  readAloudPlayAriaLabel,
  asideInnerRef,
  showReadAloud = true,
}: GameCoachingRailAsideProps) {
  return (
    <div ref={asideInnerRef} className="mission-quizLayoutAsideInner">
      {coachContent}
      {showReadAloud && readAloudSegments.length > 0 ? (
        <ReadAloudControl
          segments={readAloudSegments}
          resetKey={readAloudResetKey}
          playAriaLabel={readAloudPlayAriaLabel}
        />
      ) : null}
    </div>
  );
}
