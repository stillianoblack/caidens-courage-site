import fs from 'fs';
import path from 'path';

describe('email delivery metadata migration', () => {
  const source = fs.readFileSync(
    path.resolve(
      process.cwd(),
      'supabase/migrations/20260725000100_email_delivery_welcome_metadata.sql',
    ),
    'utf8',
  );

  test('is additive and idempotent', () => {
    expect(source).toContain('create table if not exists public.email_delivery_logs');
    expect(source).toContain('add column if not exists program_type');
    expect(source).toContain('add column if not exists recipient_role');
    expect(source).toContain('add column if not exists template_type');
    expect(source).toContain('add column if not exists recipient_identifier');
    expect(source).toContain('add column if not exists correlation_id');
    expect(source).toContain('add column if not exists retry_eligible');
    expect(source).toContain('add column if not exists delivery_event_key');
    expect(source).toContain('add column if not exists email_provider');
    expect(source).toContain('create unique index if not exists email_delivery_logs_event_key_unique');
    expect(source).toContain('alter table public.email_delivery_logs enable row level security');
    expect(source).toContain('from public, anon, authenticated');
    expect(source).toContain('to service_role');
    expect(source).not.toMatch(/\bdrop\b/i);
    expect(source).not.toMatch(/\btruncate\b/i);
    expect(source).not.toMatch(/\bdelete\s+from\b/i);
    expect(source).not.toMatch(/\bupdate\s+public\./i);
    expect(source).not.toMatch(/\bgrant\b[\s\S]*\bto\s+(anon|authenticated)\b/i);
  });

  test('documents the deterministic normalized-email SHA-256 contract', () => {
    expect(source).toContain('SHA-256');
    expect(source).toContain('lower(trim(email))');
    expect(source).toContain('resend, ses, or sendgrid');
  });
});
