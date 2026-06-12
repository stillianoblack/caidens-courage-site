import React from 'react';
import PilotActivitiesPanel from '../components/pilot-dashboard/panels/PilotActivitiesPanel';
import PilotAssessmentsPanel from '../components/pilot-dashboard/panels/PilotAssessmentsPanel';
import PilotCertificatesPanel from '../components/pilot-dashboard/panels/PilotCertificatesPanel';
import PilotFacilitatorPanel from '../components/pilot-dashboard/panels/PilotFacilitatorPanel';
import PilotGalleryPanel from '../components/pilot-dashboard/panels/PilotGalleryPanel';
import PilotOverviewPanel from '../components/pilot-dashboard/panels/PilotOverviewPanel';
import PilotRosterPanel from '../components/pilot-dashboard/panels/PilotRosterPanel';
import PilotResultsPanel from '../components/pilot-dashboard/panels/PilotResultsPanel';
import PilotWeeklyModulesPanel from '../components/pilot-dashboard/panels/PilotWeeklyModulesPanel';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { PROGRAM_BASELINE_CHECK_PATH } from '../config/courageRoutes';
import { useFacilitatorOverviewData } from '../components/pilot-dashboard/coach/FacilitatorOverviewCoachProvider';
import { usePilotTrackingResults } from '../hooks/usePilotTrackingResults';
import { useProgramDashboardNav } from '../hooks/useProgramDashboardNav';

export function ProgramOverviewTabRoute() {
  const onSelectNav = useProgramDashboardNav();
  const activeProgram = readActivePilotProgram();
  const overviewData = useFacilitatorOverviewData();

  if (!activeProgram || !overviewData) {
    return null;
  }

  return (
    <PilotOverviewPanel
      metrics={overviewData.metrics}
      moduleResults={overviewData.moduleResults}
      assessmentResults={overviewData.assessmentResults}
      participantLookup={overviewData.participantLookup}
      participants={overviewData.participants}
      familyLinks={overviewData.familyLinks}
      loading={overviewData.loading}
      warning={overviewData.warning}
      onSelectNav={onSelectNav}
      activeProgram={activeProgram}
    />
  );
}

export function ProgramRosterTabRoute() {
  const activeProgram = readActivePilotProgram();
  const programCode = activeProgram?.programCode;

  if (!activeProgram) {
    return null;
  }

  return <PilotRosterPanel programCode={programCode} />;
}

export function ProgramResultsTabRoute() {
  const activeProgram = readActivePilotProgram();
  const programCode = activeProgram?.programCode;
  const {
    metrics,
    moduleResults,
    assessmentResults,
    participantLookup,
    participants,
    familyLinks,
    warning,
    loading,
  } = usePilotTrackingResults(0, programCode, true);

  return (
    <PilotResultsPanel
      refreshKey={0}
      moduleResults={moduleResults}
      assessmentResults={assessmentResults}
      participantLookup={participantLookup}
      participants={participants}
      familyLinks={familyLinks}
      metrics={metrics}
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
