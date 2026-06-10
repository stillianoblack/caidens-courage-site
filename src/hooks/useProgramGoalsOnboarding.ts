import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProgramGoalsPortalType } from '../data/programGoalsOptions';
import {
  fetchProgramGoals,
  readProgramGoalsSkippedLocal,
  remindLaterDismissedUntil,
  saveProgramGoals,
  shouldShowGoalsOnboarding,
  writeProgramGoalsSkippedLocal,
  type ProgramGoalsRecord,
} from '../lib/programGoalsService';

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
    if (!shouldShowGoalsOnboarding(record, skipped)) return;

    const delayMs = 5000 + Math.floor(Math.random() * 2000);
    const timer = window.setTimeout(() => {
      autoShownRef.current = true;
      setOpen(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [enabled, loading, programCode, portalType, record]);

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

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
    const next: ProgramGoalsRecord = {
      program_code: programCode,
      portal_type: portalType,
      selected_goals: record?.selected_goals ?? [],
      custom_goal: record?.custom_goal,
      completed_at: null,
      dismissed_until: remindLaterDismissedUntil(),
    };
    const saved = await saveProgramGoals(next);
    setRecord(saved);
    setOpen(false);
  }, [programCode, portalType, record]);

  const skipForNow = useCallback(async () => {
    writeProgramGoalsSkippedLocal(programCode, portalType, true);
    const next: ProgramGoalsRecord = {
      program_code: programCode,
      portal_type: portalType,
      selected_goals: [],
      completed_at: null,
      dismissed_until: null,
    };
    await saveProgramGoals(next);
    setRecord(next);
    setOpen(false);
  }, [programCode, portalType]);

  return {
    open,
    openDrawer,
    closeDrawer,
    record,
    loading,
    saveGoals,
    remindLater,
    skipForNow,
    refresh,
  };
}
