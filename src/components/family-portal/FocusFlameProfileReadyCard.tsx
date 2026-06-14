import React from 'react';
import { Link } from 'react-router-dom';
import { resolveParticipantGradeDisplay } from '../../lib/participantGradeDisplay';
import type { StudentParticipantRecord } from '../../lib/pilotTrackingService';

type FocusFlameProfileReadyCardProps = {
  childName: string;
  avatarSrc?: string | null;
  participant?: StudentParticipantRecord | null;
  adventuresCompletedCount: number;
  continueLearningPath: string;
  variant?: 'inline' | 'compact';
  className?: string;
};

function resolveGradeLabel(participant?: StudentParticipantRecord | null): string {
  if (!participant) return 'Not set';
  return resolveParticipantGradeDisplay({
    gradeLevel: participant.grade_level,
    gradeBand: participant.grade_band,
    allowStretch: participant.allow_stretch_level ?? undefined,
  }).displayGrade;
}

export default function FocusFlameProfileReadyCard({
  childName,
  avatarSrc,
  participant,
  adventuresCompletedCount,
  continueLearningPath,
  variant = 'inline',
  className = '',
}: FocusFlameProfileReadyCardProps) {
  const moduleClass = [
    'ffj-profileReady',
    variant === 'compact' ? 'ffj-profileReady--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={moduleClass} aria-labelledby="ffj-profile-ready-title">
      <div className="ffj-profileReadyHeader">
        <span className="ffj-profileReadyCelebration" aria-hidden="true">
          🎉
        </span>
        {avatarSrc ? (
          <img
            className="ffj-profileReadyAvatar"
            src={avatarSrc}
            alt=""
            decoding="async"
            loading="lazy"
          />
        ) : (
          <span className="ffj-profileReadyAvatar ffj-profileReadyAvatar--placeholder" aria-hidden="true">
            ✨
          </span>
        )}
        <div className="ffj-profileReadyHeaderText">
          <h2 id="ffj-profile-ready-title" className="ffj-profileReadyTitle">
            Profile Ready
          </h2>
          <p className="ffj-profileReadyCopy">
            Congrats, {childName}! Your Focus Flame profile is set.
          </p>
        </div>
      </div>

      <ul className="ffj-profileReadyStats">
        <li>
          <span className="ffj-profileReadyStatLabel">Grade Level</span>
          <span className="ffj-profileReadyStatValue">{resolveGradeLabel(participant)}</span>
        </li>
        <li>
          <span className="ffj-profileReadyStatLabel">B-4 Check-In</span>
          <span className="ffj-profileReadyStatValue ffj-profileReadyStatValue--complete">Complete</span>
        </li>
        <li>
          <span className="ffj-profileReadyStatLabel">Family Goals</span>
          <span className="ffj-profileReadyStatValue ffj-profileReadyStatValue--complete">Set</span>
        </li>
        <li>
          <span className="ffj-profileReadyStatLabel">Adventures Completed</span>
          <span className="ffj-profileReadyStatValue">{adventuresCompletedCount}</span>
        </li>
      </ul>

      <Link to={continueLearningPath} className="ffj-profileReadyCta">
        Continue Weekly Adventures
      </Link>
    </section>
  );
}
