import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../../../lib/pilotTrackingLocalStorage';
import type { PilotTrackingMetrics } from '../../../lib/pilotTrackingMetrics';
import type { ParticipantNameLookup } from '../../../lib/pilotResultsDisplay';
import type { StudentParticipantRecord } from '../../../lib/pilotTrackingService';
import type { StudentFamilyLink } from '../../../lib/studentFamilyLinkService';
import DashboardWidgetSkeleton from '../DashboardWidgetSkeleton';
import PilotBaselineOverview from '../PilotBaselineOverview';
import PilotResultsExportsBar from '../PilotResultsExportsBar';
import PilotResultsKpiGrid from '../PilotResultsKpiGrid';
import PilotTrackingDataTables from '../PilotTrackingDataTables';
import PilotStudentDetailDrawer from '../PilotStudentDetailDrawer';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { computeNeedsAttention } from '../../../lib/pilotStudentProgress';
import PilotNeedsAttentionCard from '../PilotNeedsAttentionCard';

type PilotResultsPanelProps = {
  refreshKey?: number;
  moduleResults?: LocalModuleResultRecord[];
  assessmentResults?: LocalAssessmentV2Record[];
  participantLookup?: ParticipantNameLookup;
  participants?: StudentParticipantRecord[];
  familyLinks?: StudentFamilyLink[];
  metrics: PilotTrackingMetrics;
  warning?: string | null;
  loading?: boolean;
};

export default function PilotResultsPanel({
  refreshKey = 0,
  moduleResults = [],
  assessmentResults = [],
  participantLookup = new Map(),
  participants = [],
  familyLinks = [],
  metrics,
  warning = null,
  loading = false,
}: PilotResultsPanelProps) {
  void refreshKey;
  const location = useLocation();
  const [drawerParticipantId, setDrawerParticipantId] = useState<string | null>(null);
  const activeProgram = readActivePilotProgram();
  const hasTrackingRows = assessmentResults.length > 0 || moduleResults.length > 0;

  const needsAttention = useMemo(
    () =>
      computeNeedsAttention({
        participants,
        assessments: assessmentResults,
        modules: moduleResults,
      }),
    [participants, assessmentResults, moduleResults],
  );

  useEffect(() => {
    if (location.hash !== '#needs-attention') return;
    const timer = window.setTimeout(() => {
      document.getElementById('needs-attention')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.hash, loading]);

  if (loading) {
    return (
      <div className="pilot-panel pilot-panel--results">
        <DashboardWidgetSkeleton kpiCount={12} showGrowth />
      </div>
    );
  }

  return (
    <div className="pilot-panel pilot-panel--results">
      {warning ? <p className="pilot-syncWarning">{warning}</p> : null}

      <PilotResultsKpiGrid metrics={metrics} />

      <div id="needs-attention">
        <PilotNeedsAttentionCard counts={needsAttention} />
      </div>

      <section className="pilot-panelBlock pilot-panelBlock--baselineOverview">
        <PilotBaselineOverview
          assessmentResults={assessmentResults}
          participantLookup={participantLookup}
        />
      </section>

      <PilotTrackingDataTables
        assessmentResults={assessmentResults}
        moduleResults={moduleResults}
        participantLookup={participantLookup}
        onStudentClick={setDrawerParticipantId}
        assessmentTitle="Student Assessments"
        moduleTitle="Module Completions"
        assessmentLimit={200}
        moduleLimit={200}
        showEmptyStates
      />

      <PilotResultsExportsBar
        programCode={activeProgram?.programCode}
        participants={participants}
        familyLinks={familyLinks}
        assessmentResults={assessmentResults}
        moduleResults={moduleResults}
        participantLookup={participantLookup}
      />

      <PilotStudentDetailDrawer
        open={Boolean(drawerParticipantId)}
        participantId={drawerParticipantId}
        onClose={() => setDrawerParticipantId(null)}
        participants={participants}
        familyLinks={familyLinks}
        assessmentResults={assessmentResults}
        moduleResults={moduleResults}
        programCode={activeProgram?.programCode}
      />

      {!hasTrackingRows && metrics.baselineChecksCompleted === 0 ? (
        <p className="pilot-panelHelper">
          Results will appear here after students complete B-4 Check-In and character modules.
        </p>
      ) : null}
    </div>
  );
}
