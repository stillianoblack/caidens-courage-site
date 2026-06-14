import React from 'react';
import { readActiveChildParticipantId } from '../../config/activeChildParticipant';
import { hasConfirmedParentClaim, readParentClaimContext } from '../../config/parentClaimContext';
import { resolveTrackingProgramCode } from '../../lib/activeProgramContext';
import { isSupabaseConfigReady } from '../../lib/supabaseClient';
import { useFamilyDashboardMetrics } from '../../hooks/useFamilyDashboardMetrics';
import { useFamilyAdventureModules } from '../../hooks/useAdventureModules';
import './family-portal-dev-diagnostic.css';

function resolveDataSourceLabel(input: {
  supabaseReady: boolean;
  errors: string[];
  childCount: number;
}): string {
  if (!input.supabaseReady) return 'local_fallback (missing env)';
  if (input.errors.some((row) => row === 'missing_env')) return 'local_fallback';
  if (input.errors.length > 0) return 'supabase (with errors)';
  if (input.childCount > 0) return 'supabase';
  return 'supabase (empty roster)';
}

export default function FamilyPortalDevDiagnosticBanner() {
  const programCode = resolveTrackingProgramCode() ?? '';
  const activeChildId = readActiveChildParticipantId().trim() || '—';
  const parentClaim = readParentClaimContext();
  const claimStatus = hasConfirmedParentClaim(parentClaim) ? 'confirmed' : 'not confirmed';
  const metrics = useFamilyDashboardMetrics(programCode);
  const { error: adventureModulesError } = useFamilyAdventureModules();
  const supabaseReady = isSupabaseConfigReady();
  const dataSource = resolveDataSourceLabel({
    supabaseReady,
    errors: metrics.errors,
    childCount: metrics.visibleChildren.length,
  });

  if (process.env.NODE_ENV !== 'development') return null;

  const enabled =
    typeof window !== 'undefined' &&
    (window.localStorage.getItem('ccDevDiagnostics') === '1' ||
      new URLSearchParams(window.location.search).get('devDiagnostics') === '1');

  if (!enabled) return null;

  return (
    <aside className="familyPortalDevDiagnostic" role="status" aria-label="Development diagnostics">
      <strong className="familyPortalDevDiagnosticTitle">Dev diagnostics</strong>
      <dl className="familyPortalDevDiagnosticList">
        <div>
          <dt>Program code</dt>
          <dd>{programCode || '—'}</dd>
        </div>
        <div>
          <dt>Active child</dt>
          <dd>{activeChildId}</dd>
        </div>
        <div>
          <dt>Parent claim</dt>
          <dd>{claimStatus}</dd>
        </div>
        <div>
          <dt>Data source</dt>
          <dd>{dataSource}</dd>
        </div>
        <div>
          <dt>Children loaded</dt>
          <dd>{metrics.visibleChildren.length}</dd>
        </div>
      </dl>
      {metrics.errors.length > 0 ? (
        <p className="familyPortalDevDiagnosticErrors">
          Fetch errors: {metrics.errors.join(' · ')}
        </p>
      ) : null}
      {adventureModulesError ? (
        <p className="familyPortalDevDiagnosticErrors">
          Adventure modules: {adventureModulesError}
        </p>
      ) : null}
    </aside>
  );
}
