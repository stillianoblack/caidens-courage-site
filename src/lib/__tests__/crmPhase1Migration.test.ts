import fs from 'fs';
import path from 'path';

const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20260711000100_audience_crm_phase1_foundation.sql');

describe('CRM Phase 1 additive migration', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const executable = sql.replace(/--.*$/gm, '');

  test('contains no destructive statements', () => {
    expect(executable).not.toMatch(/\b(drop|truncate|delete|update)\b/i);
  });

  test('enables RLS for every new CRM table and creates no public policy', () => {
    const tables = ['crm_admin_roles', 'crm_admin_role_assignments', 'contacts', 'crm_platform_profiles', 'contact_sources', 'contact_identity_links', 'organizations', 'organization_units', 'organization_memberships', 'invitations', 'access_grants', 'guardian_relationships', 'admin_audit_events'];
    tables.forEach((table) => expect(sql).toContain(`alter table public.${table} enable row level security;`));
    expect(executable).not.toMatch(/create\s+policy/i);
  });

  test('does not allow child contact kinds or globally unique normalized email', () => {
    expect(sql).not.toMatch(/contact_kind[^\n]*(student|child)/i);
    expect(sql).not.toMatch(/unique[^;]*normalized_email/i);
  });
});
