import React from 'react';
import { resolveParticipantGradeDisplay } from '../../lib/participantGradeDisplay';
import './participant-grade-meta.css';

type ParticipantGradeMetaProps = {
  gradeLevel?: string | null;
  gradeBand?: string | null;
  allowStretch?: boolean;
  /** family: Grade only; facilitator: Grade + Adaptive Band; compact: Grade with tooltip */
  variant?: 'family' | 'facilitator' | 'compact';
  className?: string;
};

export default function ParticipantGradeMeta({
  gradeLevel,
  gradeBand,
  allowStretch = false,
  variant = 'family',
  className = '',
}: ParticipantGradeMetaProps) {
  const grade = resolveParticipantGradeDisplay({ gradeLevel, gradeBand, allowStretch });

  if (variant === 'compact') {
    return (
      <span
        className={`participantGradeMeta participantGradeMeta--compact${className ? ` ${className}` : ''}`}
        title={
          grade.adaptiveBand
            ? `Adaptive Content Level: ${grade.adaptiveBand}`
            : undefined
        }
      >
        Grade: {grade.displayGrade}
      </span>
    );
  }

  return (
    <div className={`participantGradeMeta${className ? ` ${className}` : ''}`}>
      <p className="participantGradeMetaLine">
        Grade: {grade.displayGrade}
        {grade.needsGradeSelection ? (
          <span className="participantGradeMetaFlag"> · selection needed</span>
        ) : null}
      </p>
      {variant === 'facilitator' && grade.adaptiveBand ? (
        <p className="participantGradeMetaLine participantGradeMetaLine--band">
          Adaptive Band: {grade.adaptiveBand}
        </p>
      ) : null}
    </div>
  );
}
