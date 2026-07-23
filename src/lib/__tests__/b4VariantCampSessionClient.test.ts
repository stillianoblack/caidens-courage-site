import fs from 'fs';
import path from 'path';

describe('B-4 camp-session client transport', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/b4VariantService.ts'),
    'utf8',
  );

  test('sends only the server-validation metadata needed for facilitator-launched kid sessions', () => {
    expect(source).toContain('campCompatibilityHeaders(sessionId)');
    const transport = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/campChildSessionApi.ts'),
      'utf8',
    );
    expect(transport).toContain("'X-Camp-Program-Id'");
    expect(transport).toContain("'X-Camp-Program-Code'");
    expect(transport).toContain("'X-Camp-Access-Code'");
    expect(transport).toContain("'X-Kid-Session-Id'");
    expect(transport).not.toContain('student_pin');
    expect(transport).not.toContain('admin_email');
  });

  test('deduplicates simultaneous preference loads and accepts explicit endpoint states', () => {
    expect(source).toContain('const inFlightLoads = new Map');
    expect(source).toContain("['saved', 'onboarding_required'].includes(body.state)");
    expect(source).toContain("selectionRequired: body.state === 'onboarding_required'");
  });

  test('validates or re-establishes an expired compatibility session before one retry', () => {
    expect(source).toContain('refreshExpiredSupabaseSession');
    expect(source).toContain('ensureCompatibilitySession(participantId)');
    expect(source).toContain('ensureCompatibilitySession(participantId, true)');
    expect(source).toContain('getCampCompatibilityChildSession(localSessionId)');
    expect(source).toContain('launchCampCompatibilityChildSession');
    expect(source).toContain('getFamilyCompatibilityChildSession(localSessionId)');
    expect(source).toContain('launchFamilyCompatibilityChildSession(participantId)');
    expect(source.match(/return requestOnce\(participantId, init\)/g)).toHaveLength(1);
  });
});
