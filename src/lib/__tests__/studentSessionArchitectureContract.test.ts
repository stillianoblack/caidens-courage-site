import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../..');
const migration = fs.readFileSync(
  path.join(
    repoRoot,
    'supabase/migrations/20260804000200_student_compatibility_sessions.sql',
  ),
  'utf8',
);
const architecture = fs.readFileSync(
  path.join(repoRoot, 'docs/security/secure-student-session-architecture.md'),
  'utf8',
);
const verifyPin = fs.readFileSync(
  path.join(repoRoot, 'netlify/functions/verify-student-pin.js'),
  'utf8',
);
const browserSession = fs.readFileSync(
  path.join(repoRoot, 'src/lib/studentPinSession.ts'),
  'utf8',
);

describe('secure student session review contract', () => {
  test('binds a hashed opaque session to student, program, and environment', () => {
    expect(migration).toContain('token_hash text not null unique');
    expect(migration).toContain('participant_id uuid not null references public.participants(id) on delete cascade');
    expect(migration).toContain('program_id uuid not null references public.pilot_programs(id) on delete cascade');
    expect(migration).toContain("check (role = 'student')");
    expect(migration).toContain("environment in ('production', 'deploy-preview', 'branch-deploy', 'dev')");
    expect(migration).toContain("token_hash ~ '^[0-9a-f]{64}$'");
    expect(migration).toContain('expires_at > issued_at');
    expect(migration).toContain("expires_at <= issued_at + interval '8 hours'");
    expect(migration).toContain('student_compatibility_sessions_expiration_cleanup_idx');
    expect(migration).toContain('student_compatibility_sessions_revoked_cleanup_idx');
  });

  test('is server-only with forced RLS and no permissive policies', () => {
    expect(migration).toContain('enable row level security');
    expect(migration).toContain('force row level security');
    expect(migration).toContain('from anon');
    expect(migration).toContain('from authenticated');
    expect(migration).toContain('to service_role');
    expect(migration).not.toMatch(/create\s+policy/i);
    expect(migration).not.toMatch(/using\s*\(\s*true\s*\)/i);
    expect(migration).not.toMatch(/with\s+check\s*\(\s*true\s*\)/i);
  });

  test('limits cleanup to old student sessions and service role execution', () => {
    expect(migration).toContain('set search_path = \'\'');
    expect(migration).toContain('delete from public.student_compatibility_sessions');
    expect(migration).toContain("retention interval default interval '7 days'");
    expect(migration).toContain('grant execute on function public.purge_expired_student_compatibility_sessions(interval) to service_role');
    expect(migration).not.toMatch(/delete\s+from\s+public\.(participants|pilot_programs|kid_play_sessions)/i);
  });

  test('documents the current browser-authoritative gap without implementing runtime behavior', () => {
    expect(verifyPin).toContain('participantId: match.id');
    expect(browserSession).toContain('window.localStorage.setItem(STUDENT_PIN_SESSION_KEY');
    expect(architecture).toContain('__Host-cc_student_session');
    expect(architecture).toContain('fixed eight-hour student session');
    expect(architecture).toContain('Do not migrate its participant ID');
    expect(architecture).toContain('Runtime implementation is deliberately deferred');
  });

  test('contains no project reference, seed, or application-data mutation', () => {
    expect(migration).not.toMatch(/bnopaocdqkknjzmmkaen|gpcsombdaxlvlizoupqw/);
    expect(migration).not.toMatch(/insert\s+into\s+public\./i);
    expect(migration).not.toMatch(/update\s+public\./i);
  });
});
