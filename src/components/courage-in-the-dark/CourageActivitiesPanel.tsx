import React from 'react';
import Week1ExtrasCards, { type Week1ExtrasPaths } from './Week1ExtrasCards';
import './courage-activities-panel.css';

type CourageActivitiesPanelProps = {
  completedMissionIds: readonly string[];
  paths: Week1ExtrasPaths;
};

export default function CourageActivitiesPanel({
  completedMissionIds,
  paths,
}: CourageActivitiesPanelProps) {
  return (
    <aside className="courageActivitiesPanel" aria-label="Week activities">
      <header className="courageActivitiesPanelHeader">
        <h3 className="courageActivitiesPanelTitle">Activities</h3>
        <p className="courageActivitiesPanelIntro">
          Family downloads, coloring, and certificates for this week.
        </p>
      </header>
      <Week1ExtrasCards
        completedMissionIds={completedMissionIds}
        paths={paths}
        variant="panel"
      />
    </aside>
  );
}
