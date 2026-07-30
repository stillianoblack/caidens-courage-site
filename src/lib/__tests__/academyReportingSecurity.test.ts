import fs from 'fs';
import path from 'path';

describe('Academy reporting security contract', () => {
  const endpoint = fs.readFileSync(
    path.join(process.cwd(), 'netlify/functions/admin-academy-outcomes.js'),
    'utf8',
  );
  const report = fs.readFileSync(
    path.join(process.cwd(), 'netlify/functions/admin-academy-report.js'),
    'utf8',
  );

  test('requires server admin authorization for reads, overrides, and reports', () => {
    expect(endpoint).toContain('requireAdmin(event)');
    expect(report).toContain('requireAdmin(event)');
  });

  test('only the override table is mutated and private credentials are not returned', () => {
    expect(endpoint).toContain(".from('academy_reporting_overrides')");
    expect(endpoint).not.toContain('student_pin_hash');
    expect(endpoint).not.toContain('family_claim_code');
    expect(report).not.toContain('student_pin');
    expect(report).not.toContain('guardian_email');
  });

  test('the dashboard and report use the same canonical Academy builder', () => {
    expect(endpoint).toContain('buildAcademyOutcomes(data');
    expect(report).toContain('buildAcademyOutcomes(data');
  });
});
