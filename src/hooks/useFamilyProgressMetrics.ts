import { useFamilyDashboardMetrics } from './useFamilyDashboardMetrics';

/** @deprecated Prefer useFamilyDashboardMetrics for a single Supabase-backed load. */
export function useFamilyProgressMetrics(programCode?: string) {
  const { metrics, loading, refresh } = useFamilyDashboardMetrics(programCode);
  return { metrics, loading, refresh };
}
