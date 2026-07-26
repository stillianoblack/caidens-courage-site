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
    expect(source).toContain('add column if not exists program_type');
    expect(source).toContain('add column if not exists recipient_role');
    expect(source).toContain('add column if not exists template_type');
    expect(source).toContain('add column if not exists recipient_identifier');
    expect(source).toContain('add column if not exists correlation_id');
    expect(source).toContain('add column if not exists retry_eligible');
    expect(source).toContain('add column if not exists delivery_event_key');
    expect(source).toContain('add column if not exists email_provider');
    expect(source).toContain('create unique index if not exists email_delivery_logs_event_key_unique');
    expect(source).not.toMatch(/\bdrop\s+(table|column)\b/i);
    expect(source).not.toMatch(/\bdelete\s+from\b/i);
  });

  test('documents the deterministic normalized-email SHA-256 contract', () => {
    expect(source).toContain('SHA-256');
    expect(source).toContain('lower(trim(email))');
    expect(source).toContain('resend, ses, or sendgrid');
  });
});
