import React from 'react';
import { Link } from 'react-router-dom';
import type { FamilyChildJourneySnapshot } from '../../lib/familyChildJourneySnapshot';
import { resolveParticipantGradeDisplay } from '../../lib/participantGradeDisplay';
import './family-child-journey-mini-card.css';

const STEP_LABELS = ['Child', 'Grade', 'Goals', 'B-4', 'Path'] as const;

type FamilyChildJourneyMiniCardProps = {
  snapshot: FamilyChildJourneySnapshot;
  isActivePlayer: boolean;
  onSetActivePlayer?: () => void;
  baselinePath: string;
  className?: string;
};

function stepComplete(snapshot: FamilyChildJourneySnapshot, index: number): boolean {
  const flags = [
    true,
    snapshot.hasChildGrade,
    snapshot.familyGoalsSet,
    snapshot.b4CheckInStatus === 'Complete',
    snapshot.isProfileReady || snapshot.adventuresCompleted > 0,
  ];
  return Boolean(flags[index]);
}

export default function FamilyChildJourneyMiniCard({
  snapshot,
  isActivePlayer,
  onSetActivePlayer,
  baselinePath,
  className = '',
}: FamilyChildJourneyMiniCardProps) {
  const gradeDisplay = resolveParticipantGradeDisplay({
    gradeLevel: snapshot.gradeLevel,
    gradeBand: snapshot.gradeBand,
  }).displayGrade;

  return (
    <article
      className={`familyChildJourneyMiniCard${isActivePlayer ? ' familyChildJourneyMiniCard--active' : ' familyChildJourneyMiniCard--inactive'}${className ? ` ${className}` : ''}`}
      aria-label={`${snapshot.displayName} Focus Flame Journey`}
    >
      <div className="familyChildJourneyMiniCardHead">
        <div className="familyChildJourneyMiniCardIdentity">
          <h3 className="familyChildJourneyMiniCardName">{snapshot.displayName}</h3>
          <p className="familyChildJourneyMiniCardMeta">
            Grade {gradeDisplay} · {snapshot.journeyCompletedCount}/{snapshot.journeyTotalSteps} steps
          </p>
        </div>
        {isActivePlayer ? (
          <span className="familyChildJourneyMiniCardActivePill">Active player</span>
        ) : onSetActivePlayer ? (
          <button type="button" className="familyChildJourneyMiniCardSetActiveBtn" onClick={onSetActivePlayer}>
            Set as active player
          </button>
        ) : null}
      </div>

      <ol className="familyChildJourneyMiniCardSteps" aria-label="Journey steps">
        {STEP_LABELS.map((label, index) => {
          const complete = stepComplete(snapshot, index);
          return (
            <li
              key={label}
              className={`familyChildJourneyMiniCardStep${complete ? ' familyChildJourneyMiniCardStep--complete' : ''}`}
            >
              <span className="familyChildJourneyMiniCardStepDot" aria-hidden="true" />
              <span>{label}</span>
            </li>
          );
        })}
      </ol>

      <div className="familyChildJourneyMiniCardStats">
        <span>Baseline: {snapshot.baselineStatus}</span>
        <span>B-4: {snapshot.b4CheckInStatus}</span>
        <span>Goals: {snapshot.familyGoalsSet ? 'Set' : 'Needed'}</span>
        <span>Adventures: {snapshot.adventuresCompleted}</span>
        <span>Progress: {snapshot.progressPct}%</span>
      </div>

      {!snapshot.b4CheckInStatus || snapshot.b4CheckInStatus !== 'Complete' ? (
        <Link to={baselinePath} className="familyChildJourneyMiniCardLink familyChildJourneyMiniCardCta">
          Complete B-4 Check-In
        </Link>
      ) : null}
    </article>
  );
}
