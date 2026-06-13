import React from 'react';
import { formatGradeLevelDisplay } from '../../data/gradeLevelOptions';
import { readActiveChildNickname } from '../../config/activeChildNickname';
import B4BaselineGradeGate from '../b4-baseline-check/B4BaselineGradeGate';
import { hasCanonicalGradeLevel } from '../../lib/participantGradeDisplay';
import '../b4-baseline-check/b4-baseline-check.css';

type B4MissionGradeBriefingProps = {
  participantId: string;
  gradeLevel: string | null | undefined;
  missionTitle?: string;
  onContinue: () => void;
  onGradeSaved: () => void;
};

export default function B4MissionGradeBriefing({
  participantId,
  gradeLevel,
  missionTitle,
  onContinue,
  onGradeSaved,
}: B4MissionGradeBriefingProps) {
  const displayName = readActiveChildNickname() || 'Explorer';

  if (!hasCanonicalGradeLevel(gradeLevel)) {
    return (
      <B4BaselineGradeGate
        participantId={participantId}
        onComplete={() => {
          onGradeSaved();
          onContinue();
        }}
      />
    );
  }

  const gradeLabel = formatGradeLevelDisplay(gradeLevel);

  return (
    <section className="bbc-gradeGate bbc-missionBriefing" aria-labelledby="b4-mission-briefing-title">
      <p className="bbc-missionBriefingEyebrow">Mission Briefing</p>
      <h2 id="b4-mission-briefing-title" className="bbc-gradeGateTitle">
        Welcome back, {displayName}.
      </h2>
      <p className="bbc-missionBriefingBody">
        {missionTitle
          ? `Today's mission, ${missionTitle}, is designed for ${gradeLabel} explorers.`
          : `Today's mission is designed for ${gradeLabel} explorers.`}
      </p>
      <p className="bbc-missionBriefingBody">Let's practice focus together.</p>
      <button type="button" className="bbc-primaryBtn bbc-landingCta" onClick={onContinue}>
        Start Mission
      </button>
    </section>
  );
}
