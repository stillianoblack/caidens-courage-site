import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProgramGoalsPortalType } from '../data/programGoalsOptions';
import {
  fetchProgramGoals,
  readGoalsDrawerDismissedUntilLocal,
  readProgramGoalsSkippedLocal,
  remindLaterDismissedUntil,
  saveProgramGoals,
  shouldShowGoalsOnboarding,
  skipGoalsDismissedUntil,
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
  const autoShownRef = useRef(false);

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

  useEffect(() => {
    if (!enabled || loading || autoShownRef.current || !programCode.trim()) return;

    const skipped = readProgramGoalsSkippedLocal(programCode, portalType);
    const localDismissedUntil = readGoalsDrawerDismissedUntilLocal(programCode, portalType);
    if (!shouldShowGoalsOnboarding(record, skipped, localDismissedUntil)) return;

    const delayMs = 5000 + Math.floor(Math.random() * 2000);
    const timer = window.setTimeout(() => {
      autoShownRef.current = true;
      setOpen(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [enabled, loading, programCode, portalType, record]);

  const openDrawer = useCallback(() => {
    autoShownRef.current = true;
    setOpen(true);
  }, []);

  const dismissDrawer = useCallback(
    async (reason: GoalsDismissReason) => {
      if (!programCode.trim()) {
        setOpen(false);
        return;
      }

      autoShownRef.current = true;
      const dismissedUntil =
        reason === 'skip' ? skipGoalsDismissedUntil() : remindLaterDismissedUntil();

      if (reason === 'skip') {
        writeProgramGoalsSkippedLocal(programCode, portalType, true);
      } else {
        writeProgramGoalsSkippedLocal(programCode, portalType, false);
      }

      const next: ProgramGoalsRecord = {
        program_code: programCode,
        portal_type: portalType,
        selected_goals: reason === 'skip' ? [] : (record?.selected_goals ?? []),
        custom_goal: record?.custom_goal,
        completed_at: null,
        dismissed_until: dismissedUntil,
      };
      const saved = await saveProgramGoals(next);
      setRecord(saved);
      setOpen(false);
    },
    [programCode, portalType, record],
  );

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
      autoShownRef.current = true;
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
