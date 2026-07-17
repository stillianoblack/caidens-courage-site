import fs from 'fs';
import path from 'path';

describe('B-4 camp-session client transport', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/b4VariantService.ts'),
    'utf8',
  );

  test('sends only the server-validation metadata needed for facilitator-launched kid sessions', () => {
    expect(source).toContain("'X-Camp-Program-Code'");
    expect(source).toContain("'X-Camp-Access-Code'");
    expect(source).toContain("'X-Kid-Session-Id'");
    expect(source).not.toContain('student_pin');
    expect(source).not.toContain('admin_email');
  });

  test('deduplicates simultaneous preference loads and accepts explicit endpoint states', () => {
    expect(source).toContain('const inFlightLoads = new Map');
    expect(source).toContain("['saved', 'onboarding_required'].includes(body.state)");
    expect(source).toContain("selectionRequired: body.state === 'onboarding_required'");
  });
});
