import fs from 'fs'; import path from 'path';
describe('CRM Phase 2 migration safety', () => {
  const sql = fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations/20260711_audience_crm_phase2_workflows.sql'), 'utf8');
  const executable = sql.replace(/--.*$/gm, '');
  test('is additive and default-deny', () => {
    expect(executable).not.toMatch(/\b(drop|truncate|delete)\b/i);
    expect(executable).not.toMatch(/create\s+policy/i);
    ['consent_events','communication_preferences','lifecycle_events','contact_lifecycle_state','contact_interests','customer_relationships','entitlements','crm_notes','crm_tasks','crm_activities','segment_definitions','segment_eligibility','provider_accounts','provider_segment_mappings'].forEach((table) => expect(sql).toContain(`alter table public.${table} enable row level security;`));
  });
  test('keeps consent and lifecycle history append-only by exposing no update policy', () => {
    expect(executable).not.toMatch(/policy[^;]*(consent_events|lifecycle_events)/i);
  });
});
