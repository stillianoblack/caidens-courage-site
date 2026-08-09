import { useCallback, useEffect, useState } from 'react';
import type { ProgramGoalsPortalType } from '../data/programGoalsOptions';
import { fetchProgramGoals, saveProgramGoals, type ProgramGoalsRecord } from '../lib/programGoalsService';
import { readParticipantUiDismissed, saveParticipantUiDismissed } from '../lib/participantUiState';

const STUDENT_KEY = 'dashboard-welcome-v1';

export function useProgramDashboardOnboarding(programCode: string, portalType: ProgramGoalsPortalType) {
  const [record, setRecord] = useState<ProgramGoalsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    if (!programCode.trim()) { setLoading(false); return; }
    void fetchProgramGoals(programCode, portalType).then((next) => {
      if (active) { setRecord(next); setLoading(false); }
    });
    return () => { active = false; };
  }, [portalType, programCode]);
  const dismiss = useCallback(async () => {
    setSaving(true);
    const saved = await saveProgramGoals({
      program_code: programCode,
      portal_type: portalType,
      selected_goals: record?.selected_goals ?? [],
      custom_goal: record?.custom_goal ?? null,
      completed_at: record?.completed_at ?? null,
      dismissed_until: record?.dismissed_until ?? null,
      dashboard_onboarding_dismissed_at: new Date().toISOString(),
    });
    setRecord(saved);
    setSaving(false);
  }, [portalType, programCode, record]);
  return { visible: !loading && !record?.dashboard_onboarding_dismissed_at, loading, saving, dismiss };
}

export function useStudentDashboardOnboarding(participantId?: string) {
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    void readParticipantUiDismissed(STUDENT_KEY, participantId).then((dismissed) => {
      if (active) setVisible(!dismissed);
    });
    return () => { active = false; };
  }, [participantId]);
  const dismiss = useCallback(async () => {
    setSaving(true);
    setVisible(false);
    await saveParticipantUiDismissed(STUDENT_KEY, participantId);
    setSaving(false);
  }, [participantId]);
  return { visible, saving, dismiss };
}
