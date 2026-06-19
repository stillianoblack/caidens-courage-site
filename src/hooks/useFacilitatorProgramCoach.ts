import { useEffect, useMemo, useState } from 'react';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../lib/pilotTrackingLocalStorage';
import type { PilotTrackingMetrics } from '../lib/pilotTrackingMetrics';
import {
  buildFacilitatorProgramCoachModel,
  type FacilitatorProgramCoachModel,
} from '../lib/facilitatorProgramCoachModel';
import { openFacilitatorAccessCodes } from '../lib/openFacilitatorAccessCodes';
import {
  PROGRAM_GOALS_SAVED_EVENT,
  type ProgramGoalsRecord,
} from '../lib/programGoalsService';
import type { StudentParticipantRecord } from '../lib/pilotTrackingService';
import type { StudentFamilyLink } from '../lib/studentFamilyLinkService';
import type { ActivePilotProgram } from '../types/pilotProgram';

type UseFacilitatorProgramCoachOptions = {
  participants: StudentParticipantRecord[];
  assessments: LocalAssessmentV2Record[];
  modules: LocalModuleResultRecord[];
  metrics: PilotTrackingMetrics;
  activeProgram?: ActivePilotProgram | null;
  familyLinks?: StudentFamilyLink[];
  onCopyFamilyCode?: () => void;
  parentNotConnectedCount?: number;
  missingPinCount?: number;
  /** Reuse goals already loaded for onboarding instead of fetching again. */
  sharedProgramGoals?: ProgramGoalsRecord | null;
};

export function useFacilitatorProgramCoach({
  participants,
  assessments,
  modules,
  metrics,
  activeProgram,
  familyLinks = [],
  onCopyFamilyCode,
  parentNotConnectedCount = 0,
  missingPinCount = 0,
  sharedProgramGoals,
}: UseFacilitatorProgramCoachOptions): FacilitatorProgramCoachModel {
  const programCode = activeProgram?.programCode?.trim() ?? '';
  const [programGoals, setProgramGoals] = useState<ProgramGoalsRecord | null>(
    sharedProgramGoals ?? null,
  );

  useEffect(() => {
    if (sharedProgramGoals !== undefined) {
      setProgramGoals(sharedProgramGoals);
    }
  }, [sharedProgramGoals]);

  useEffect(() => {
    if (!programCode) return undefined;

    const handleGoalsSaved = (event: Event) => {
      const detail = (event as CustomEvent<ProgramGoalsRecord>).detail;
      if (!detail || detail.program_code?.trim() !== programCode) return;
      setProgramGoals(detail);
    };

    window.addEventListener(PROGRAM_GOALS_SAVED_EVENT, handleGoalsSaved);
    return () => window.removeEventListener(PROGRAM_GOALS_SAVED_EVENT, handleGoalsSaved);
  }, [programCode]);

  return useMemo(
    () =>
      buildFacilitatorProgramCoachModel({
        participants,
        assessments,
        modules,
        metrics,
        activeProgram,
        programGoals,
        familyLinksCount: familyLinks.length,
        parentNotConnectedCount,
        missingPinCount,
        onOpenAccessCodes: openFacilitatorAccessCodes,
        onCopyFamilyCode,
      }),
    [
      activeProgram,
      assessments,
      familyLinks.length,
      missingPinCount,
      parentNotConnectedCount,
      metrics,
      modules,
      onCopyFamilyCode,
      participants,
      programGoals,
    ],
  );
}
