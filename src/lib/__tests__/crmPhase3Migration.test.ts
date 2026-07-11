import fs from 'fs'; import path from 'path';
describe('CRM Phase 3 migration safety', () => {
  const sql = fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations/20260711_audience_crm_phase3_kit_automation.sql'), 'utf8'); const executable = sql.replace(/--.*$/gm, '');
  test('is additive and default deny', () => {
    expect(executable).not.toMatch(/\b(drop|truncate|delete)\b/i); expect(executable).not.toMatch(/create\s+policy/i);
    ['provider_contacts','email_sync_outbox','email_sync_attempts','provider_webhook_events','provider_metric_sync_runs','provider_broadcasts','provider_broadcast_metrics','provider_tag_snapshots','provider_sequence_snapshots'].forEach((table) => expect(sql).toContain(`alter table public.${table} enable row level security;`));
  });
  test('defaults contacts and intents to safe hold', () => { expect(sql).toContain('provider_sync_hold boolean not null default true'); expect(sql).toContain("status text not null default 'held'"); });
});
