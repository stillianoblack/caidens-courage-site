import React, { useMemo } from 'react';
import B4ResultsAdminDashboard from '../b4-baseline-check/B4ResultsAdminDashboard';
import type { LocalAssessmentV2Record } from '../../lib/pilotTrackingLocalStorage';
import { baselineRecordsFromAssessmentV2 } from '../../lib/baselineV2Display';
import type { ParticipantNameLookup } from '../../lib/pilotResultsDisplay';
import '../b4-baseline-check/b4-results-admin.css';

type PilotBaselineOverviewProps = {
  assessmentResults: LocalAssessmentV2Record[];
  participantLookup: ParticipantNameLookup;
  showStatGrid?: boolean;
};

export default function PilotBaselineOverview({
  assessmentResults,
  participantLookup,
  showStatGrid = false,
}: PilotBaselineOverviewProps) {
  const baselineRecords = useMemo(
    () => baselineRecordsFromAssessmentV2(assessmentResults, participantLookup),
    [assessmentResults, participantLookup],
  );

  if (baselineRecords.length === 0) {
    return (
      <p className="pilot-emptyNote">
        Baseline overview will appear after students complete the B-4 Baseline Check.
      </p>
    );
  }

  return (
    <B4ResultsAdminDashboard
      results={baselineRecords}
      showStatGrid={showStatGrid}
      feelingsLabel="Feelings / Confidence"
    />
  );
}
