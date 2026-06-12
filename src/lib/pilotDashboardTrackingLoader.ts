import { loadAssessmentResults } from './assessmentResultsService';
import { loadProgramParticipantDirectory } from './pilotParticipantDirectory';
import { collectParticipantIdsFromResults } from './pilotResultsDisplay';
import { dedupePortalFetch } from './portalFetchDedupe';
import { fetchStudentFamilyLinksByCampProgram } from './studentFamilyLinkService';
import { loadPilotTrackingData } from './pilotTrackingService';

export type PilotDashboardTrackingPayload = {
  legacyPayload: Awaited<ReturnType<typeof loadAssessmentResults>>;
  trackingPayload: Awaited<ReturnType<typeof loadPilotTrackingData>>;
  familyLinksPayload: Awaited<ReturnType<typeof fetchStudentFamilyLinksByCampProgram>>;
  directoryPayload: Awaited<ReturnType<typeof loadProgramParticipantDirectory>>;
};

export function loadPilotDashboardTracking(programCode: string): Promise<PilotDashboardTrackingPayload> {
  const code = programCode.trim();
  return dedupePortalFetch(`pilot-dashboard-tracking:${code}`, async () => {
    const [legacyPayload, trackingPayload, familyLinksPayload] = await Promise.all([
      loadAssessmentResults(code),
      loadPilotTrackingData(code),
      fetchStudentFamilyLinksByCampProgram(code),
    ]);

    const resultParticipantIds = collectParticipantIdsFromResults({
      moduleResults: trackingPayload.moduleResults,
      assessmentResults: trackingPayload.assessmentResults,
    });
    const directoryPayload = await loadProgramParticipantDirectory(code, resultParticipantIds);

    return {
      legacyPayload,
      trackingPayload,
      familyLinksPayload,
      directoryPayload,
    };
  });
}
