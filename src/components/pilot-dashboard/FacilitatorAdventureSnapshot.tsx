import React from 'react';
import { openProgramGoals } from '../../lib/openProgramGoals';

export type FacilitatorAdventureSnapshotData = {
  studentsEnrolled: number;
  learnersWithCompletedAdventure: number;
  completedAdventures: number;
  readyToPlay: number;
  parentConnected: number;
  warning: boolean;
};

type FacilitatorAdventureSnapshotProps = {
  data: FacilitatorAdventureSnapshotData;
  placement: 'rail' | 'inline';
};

export default function FacilitatorAdventureSnapshot({
  data,
  placement,
}: FacilitatorAdventureSnapshotProps) {
  return (
    <aside
      className={`pilot-adventureSnapshot pilot-adventureSnapshot--${placement}`}
      aria-labelledby={`academy-adventure-title-${placement}`}
    >
      <img
        className="pilot-adventureSnapshotB4"
        src="/images/Choose-Your-Guide/B-4orange.webp"
        alt=""
      />
      <span className="pilot-adventureSnapshotEyebrow">LIVE PROGRAM SNAPSHOT</span>
      <h3 id={`academy-adventure-title-${placement}`}>Your Academy Adventure</h3>
      <p>A live snapshot of how your learners are moving through the Focus Flame journey.</p>
      {data.warning ? (
        <div className="pilot-adventureSnapshotUnavailable">
          We couldn’t load the latest snapshot. Your roster is still available.
        </div>
      ) : (
        <dl className="pilot-adventureSnapshotMetrics">
          <div><dt>Students enrolled</dt><dd>{data.studentsEnrolled}</dd></div>
          <div><dt>Completed an adventure</dt><dd>{data.learnersWithCompletedAdventure}</dd></div>
          <div><dt>Completed adventures</dt><dd>{data.completedAdventures}</dd></div>
          <div><dt>Ready to play</dt><dd>{data.readyToPlay}</dd></div>
          <div><dt>Parent connected</dt><dd>{data.parentConnected}</dd></div>
        </dl>
      )}
      <p className="pilot-adventureSnapshotNarrative">
        {data.completedAdventures > 0
          ? 'Momentum is building.'
          : 'No adventures have been recorded yet.'}
      </p>
      <button type="button" className="pilot-adventureGoalsBtn" onClick={openProgramGoals}>
        <span aria-hidden="true">✦</span> What would you like to improve?
      </button>
      <small>Choose the focus areas you want Caiden’s Courage to support.</small>
    </aside>
  );
}
