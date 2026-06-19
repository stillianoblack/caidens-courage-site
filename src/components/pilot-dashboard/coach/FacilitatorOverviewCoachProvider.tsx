import React, { createContext, useContext } from 'react';
import { readActivePilotProgram } from '../../../config/activePilotProgram';
import { useCoachViewportPlacement, type CoachViewportPlacement } from '../../../hooks/useCoachViewportPlacement';
import { useFacilitatorProgramCoach } from '../../../hooks/useFacilitatorProgramCoach';
import { usePilotTrackingResults } from '../../../hooks/usePilotTrackingResults';
import { usePilotRosterData } from '../../../hooks/usePilotRosterData';
import type { FacilitatorProgramCoachModel } from '../../../lib/facilitatorProgramCoachModel';
import type { ParticipantNameLookup } from '../../../lib/pilotResultsDisplay';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../../../lib/pilotTrackingLocalStorage';
import type { PilotTrackingMetrics } from '../../../lib/pilotTrackingMetrics';
import type { ProgramGoalsRecord } from '../../../lib/programGoalsService';
import type { StudentParticipantRecord } from '../../../lib/pilotTrackingService';
import type { StudentFamilyLink } from '../../../lib/studentFamilyLinkService';
import type { ActivePilotProgram } from '../../../types/pilotProgram';
import { useCopyToast } from '../../shared/useCopyToast';
import FacilitatorProgramCoachPanel from './FacilitatorProgramCoachPanel';

export type FacilitatorOverviewContextValue = {
  metrics: PilotTrackingMetrics;
  moduleResults: LocalModuleResultRecord[];
  assessmentResults: LocalAssessmentV2Record[];
  participantLookup: ParticipantNameLookup;
  participants: StudentParticipantRecord[];
  familyLinks: StudentFamilyLink[];
  loading: boolean;
  warning?: string | null;
  coachModel: FacilitatorProgramCoachModel | undefined;
  coachPlacement: CoachViewportPlacement;
};

const FacilitatorOverviewContext = createContext<FacilitatorOverviewContextValue | null>(null);

type FacilitatorOverviewCoachProviderProps = {
  children: React.ReactNode;
  enabled?: boolean;
  programCode?: string;
  activeProgram?: ActivePilotProgram | null;
  sharedProgramGoals?: ProgramGoalsRecord | null;
};

/** Single data source for Facilitator Overview dashboard + B-4 Program Coach rail. */
export function FacilitatorOverviewCoachProvider({
  children,
  enabled = true,
  programCode,
  activeProgram = readActivePilotProgram(),
  sharedProgramGoals,
}: FacilitatorOverviewCoachProviderProps) {
  const resolvedProgramCode = programCode ?? activeProgram?.programCode;
  const coachPlacement = useCoachViewportPlacement();
  const {
    participants,
    familyLinks,
    moduleResults,
    assessmentResults,
    metrics,
    participantLookup,
    loading,
    warning,
  } = usePilotTrackingResults(0, resolvedProgramCode, enabled);
  const { rows: rosterRows } = usePilotRosterData(resolvedProgramCode, enabled);
  const parentNotConnectedCount = rosterRows.filter(
    (row) => row.parentConnectionStatus === 'unclaimed',
  ).length;
  const missingPinCount = rosterRows.filter((row) => !row.hasPin).length;
  const { copyWithToast } = useCopyToast();

  const coachModel = useFacilitatorProgramCoach({
    participants,
    assessments: assessmentResults,
    modules: moduleResults,
    metrics,
    activeProgram,
    familyLinks,
    parentNotConnectedCount,
    missingPinCount,
    sharedProgramGoals: enabled ? sharedProgramGoals : undefined,
    onCopyFamilyCode: activeProgram?.familyAccessCode
      ? () => void copyWithToast(activeProgram.familyAccessCode)
      : undefined,
  });

  const value: FacilitatorOverviewContextValue = {
    metrics,
    moduleResults,
    assessmentResults,
    participantLookup,
    participants,
    familyLinks,
    loading: enabled && loading,
    warning: warning ?? null,
    coachModel: enabled ? coachModel : undefined,
    coachPlacement,
  };

  return (
    <FacilitatorOverviewContext.Provider value={enabled ? value : null}>
      {children}
    </FacilitatorOverviewContext.Provider>
  );
}

export function useFacilitatorOverviewData(): FacilitatorOverviewContextValue | null {
  return useContext(FacilitatorOverviewContext);
}

type FacilitatorOverviewCoachSlotProps = {
  slot: 'afterMetrics' | 'afterHero' | 'footer';
};

/** Renders one inline coach surface for the active tablet/mobile breakpoint only. */
export function FacilitatorOverviewCoachSlot({ slot }: FacilitatorOverviewCoachSlotProps) {
  const context = useFacilitatorOverviewData();
  if (!context || context.coachPlacement !== slot) return null;

  const placementClass =
    slot === 'afterMetrics'
      ? 'portal-rightRailCoach--inlineMetrics'
      : slot === 'afterHero'
        ? 'portal-rightRailCoach--inlineHero'
        : 'portal-rightRailCoach--inlineFooter';

  return (
    <div className={['portal-rightRailCoach', 'portal-rightRailCoach--inline', placementClass].join(' ')}>
      <FacilitatorProgramCoachPanel model={context.coachModel} loading={context.loading} />
    </div>
  );
}
