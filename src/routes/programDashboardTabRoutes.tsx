import React from 'react';
import PilotActivitiesPanel from '../components/pilot-dashboard/panels/PilotActivitiesPanel';
import PilotAssessmentsPanel from '../components/pilot-dashboard/panels/PilotAssessmentsPanel';
import PilotCertificatesPanel from '../components/pilot-dashboard/panels/PilotCertificatesPanel';
import PilotFacilitatorPanel from '../components/pilot-dashboard/panels/PilotFacilitatorPanel';
import PilotGalleryPanel from '../components/pilot-dashboard/panels/PilotGalleryPanel';
import PilotOverviewPanel from '../components/pilot-dashboard/panels/PilotOverviewPanel';
import PilotResultsPanel from '../components/pilot-dashboard/panels/PilotResultsPanel';
import PilotWeeklyModulesPanel from '../components/pilot-dashboard/panels/PilotWeeklyModulesPanel';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { PROGRAM_BASELINE_CHECK_PATH } from '../config/courageRoutes';
import { usePilotTrackingResults } from '../hooks/usePilotTrackingResults';
import { useProgramDashboardNav } from '../hooks/useProgramDashboardNav';

export function ProgramOverviewTabRoute() {
  const onSelectNav = useProgramDashboardNav();
  const activeProgram = readActivePilotProgram();
  const programCode = activeProgram?.programCode;
  const { metrics, loading, source, warning } = usePilotTrackingResults(0, programCode, true);

  if (!activeProgram) {
    return null;
  }

  return (
    <PilotOverviewPanel
      metrics={metrics}
      loading={loading}
      source={source}
      warning={warning}
      onSelectNav={onSelectNav}
      activeProgram={activeProgram}
    />
  );
}

export function ProgramResultsTabRoute() {
  const activeProgram = readActivePilotProgram();
  const programCode = activeProgram?.programCode;
  const { metrics, legacyResults: results, source, warning, loading } = usePilotTrackingResults(
    0,
    programCode,
    true,
  );

  return (
    <PilotResultsPanel
      refreshKey={0}
      results={results}
      metrics={metrics}
      source={source}
      warning={warning}
      loading={loading}
    />
  );
}

export function ProgramWeeklyModulesTabRoute() {
  return <PilotWeeklyModulesPanel />;
}

export function ProgramActivitiesTabRoute() {
  return <PilotActivitiesPanel />;
}

export function ProgramAssessmentsTabRoute() {
  return <PilotAssessmentsPanel baselineHref={PROGRAM_BASELINE_CHECK_PATH} />;
}

export function ProgramCertificatesTabRoute() {
  return <PilotCertificatesPanel />;
}

export function ProgramGalleryTabRoute() {
  const activeProgram = readActivePilotProgram();
  return (
    <PilotGalleryPanel
      programCode={activeProgram?.programCode}
      groupName={activeProgram?.groupName}
    />
  );
}

export function ProgramFacilitatorCenterTabRoute() {
  return <PilotFacilitatorPanel />;
}
