import { useCallback, useEffect, useState } from 'react';
import type { ProgramGoalsPortalType } from '../data/programGoalsOptions';
import {
  fetchProgramGoals,
  saveProgramGoals,
  writeProgramGoalsSkippedLocal,
  type ProgramGoalsRecord,
} from '../lib/programGoalsService';

export type GoalsDismissReason = 'close' | 'remind' | 'skip';

type UseProgramGoalsOnboardingOptions = {
  programCode: string;
  portalType?: ProgramGoalsPortalType;
  enabled?: boolean;
};

export function useProgramGoalsOnboarding({
  programCode,
  portalType = 'facilitator',
  enabled = true,
}: UseProgramGoalsOnboardingOptions) {
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<ProgramGoalsRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!programCode.trim()) {
      setRecord(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const next = await fetchProgramGoals(programCode, portalType);
    setRecord(next);
    setLoading(false);
  }, [programCode, portalType]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  const openDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const dismissDrawer = useCallback(async (_reason: GoalsDismissReason) => {
    // The facilitator goals experience is manual-only. Closing never changes or schedules goals.
    setOpen(false);
  }, []);

  const saveGoals = useCallback(
    async (selectedGoals: string[], customGoal?: string) => {
      const next: ProgramGoalsRecord = {
        program_code: programCode,
        portal_type: portalType,
        selected_goals: selectedGoals,
        custom_goal: customGoal?.trim() || null,
        completed_at: new Date().toISOString(),
        dismissed_until: null,
      };
      const saved = await saveProgramGoals(next);
      setRecord(saved);
      writeProgramGoalsSkippedLocal(programCode, portalType, false);
      setOpen(false);
    },
    [programCode, portalType],
  );

  const remindLater = useCallback(async () => {
    await dismissDrawer('remind');
  }, [dismissDrawer]);

  const skipForNow = useCallback(async () => {
    await dismissDrawer('skip');
  }, [dismissDrawer]);

  return {
    open,
    openDrawer,
    closeDrawer: () => dismissDrawer('close'),
    dismissDrawer,
    record,
    loading,
    saveGoals,
    remindLater,
    skipForNow,
    refresh,
  };
}
