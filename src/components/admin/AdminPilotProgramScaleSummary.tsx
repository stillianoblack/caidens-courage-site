import React, { useEffect, useState } from 'react';
import type { PilotProgramRecord } from '../../types/pilotProgram';
import { fetchPilotProgramStudentCount } from '../../lib/pilotProgramAdminScale';
import {
  FACILITATOR_TOOLS_RECOMMENDATION_NOTE,
  formatEstimatedStudentRange,
  resolveProgramScaleFromCount,
  shouldRecommendFacilitatorTools,
} from '../../lib/pilotProgramScale';

type AdminPilotProgramScaleSummaryProps = {
  program: PilotProgramRecord;
  onEditEstimate?: () => void;
};

export default function AdminPilotProgramScaleSummary({
  program,
  onEditEstimate,
}: AdminPilotProgramScaleSummaryProps) {
  const [currentStudents, setCurrentStudents] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchPilotProgramStudentCount(program.program_code).then((count) => {
      if (cancelled) return;
      setCurrentStudents(count);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [program.program_code]);

  const estimatedLabel = formatEstimatedStudentRange(program);
  const scale =
    currentStudents != null && currentStudents > 0
      ? resolveProgramScaleFromCount(currentStudents)
      : { tier: null, label: null };
  const showRecommendation =
    currentStudents != null &&
    shouldRecommendFacilitatorTools(program, currentStudents);

  return (
    <div className="adminPortal-programScale">
      <p className="adminPortal-programScaleLine">
        <span className="adminPortal-programScaleLabel">Estimated students:</span>{' '}
        {estimatedLabel}
        {onEditEstimate ? (
          <>
            {' '}
            <button
              type="button"
              className="adminPortal-linkBtn"
              onClick={onEditEstimate}
            >
              Edit
            </button>
          </>
        ) : null}
      </p>
      <p className="adminPortal-programScaleLine">
        <span className="adminPortal-programScaleLabel">Current students:</span>{' '}
        {loading ? '…' : currentStudents ?? 0}
        {scale.label ? (
          <>
            <span className="adminPortal-programMetaDivider"> · </span>
            {scale.label}
          </>
        ) : null}
      </p>
      {showRecommendation ? (
        <p className="adminPortal-programScaleRecommendation" role="status">
          {FACILITATOR_TOOLS_RECOMMENDATION_NOTE}
        </p>
      ) : null}
    </div>
  );
}
