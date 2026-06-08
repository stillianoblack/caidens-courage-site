import { useFamilyDashboardMetrics } from './useFamilyDashboardMetrics';

/** @deprecated Prefer useFamilyDashboardMetrics for a single Supabase-backed load. */
export function useFamilyChildrenMetrics(programCode?: string) {
  const { children, loading, refresh } = useFamilyDashboardMetrics(programCode);
  return { children, loading, refresh };
}
