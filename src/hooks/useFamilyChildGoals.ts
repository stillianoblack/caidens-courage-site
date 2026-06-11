import { useCallback, useEffect, useState } from 'react';
import {
  fetchFamilyChildGoals,
  hasFamilyChildGoals,
  type FamilyChildGoalsRecord,
} from '../lib/familyChildGoalsService';
import { FAMILY_CHILD_GOALS_SAVED_EVENT } from '../lib/familyChildGoalsService';

export function useFamilyChildGoals(
  programCode: string,
  childId?: string | null,
  childName?: string | null,
) {
  const [record, setRecord] = useState<FamilyChildGoalsRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!programCode.trim()) {
      setRecord(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const next = await fetchFamilyChildGoals(programCode, childId, childName);
    setRecord(next);
    setLoading(false);
  }, [programCode, childId, childName]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onSaved = (event: Event) => {
      const detail = (event as CustomEvent<FamilyChildGoalsRecord>).detail;
      if (detail?.family_program_code === programCode) {
        if (!childId || detail.child_id === childId) {
          setRecord(detail);
        }
      }
    };
    window.addEventListener(FAMILY_CHILD_GOALS_SAVED_EVENT, onSaved);
    return () => window.removeEventListener(FAMILY_CHILD_GOALS_SAVED_EVENT, onSaved);
  }, [programCode, childId]);

  return {
    record,
    loading,
    complete: hasFamilyChildGoals(record),
    refresh,
  };
}
