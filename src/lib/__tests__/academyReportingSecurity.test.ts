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
  const dashboard = fs.readFileSync(
    path.join(process.cwd(), 'src/components/admin/AdminAcademyOverview.tsx'),
    'utf8',
  );
  const dashboardStyles = fs.readFileSync(
    path.join(process.cwd(), 'src/components/admin/admin-academy-overview.css'),
    'utf8',
  );
  const api = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/pilotOutcomesApi.ts'),
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

  test('uses mutually exclusive cohort labels and does not present stale 33', () => {
    expect(dashboard).toContain('Canonical student accounts');
    expect(dashboard).toContain('Established reporting cohort');
    expect(dashboard).toContain('Emerging participants');
    expect(dashboard).toContain('Minimal/no engagement');
    expect(dashboard).toContain('Test/internal excluded');
    expect(dashboard).not.toContain('24 below eligibility threshold');
    expect(dashboard).not.toMatch(/Participant accounts['"]\s*,\s*33/);
    expect(api).toContain("cache: 'no-store'");
    expect(api).toContain('?refresh=${Date.now()}');
  });

  test('presents readable program name before secondary program code', () => {
    expect(dashboard.indexOf('{row.programName}')).toBeLessThan(dashboard.indexOf('{row.programCode}'));
    expect(dashboard).toContain('Student {row.studentIdentifier}');
  });

  test('transforms cohort rows into mobile cards without horizontal overflow', () => {
    expect(dashboardStyles).toContain('@media (max-width: 760px)');
    expect(dashboardStyles).toContain('.academyOverview-cohortRow { grid-template-columns: 1fr; overflow: hidden; }');
  });
});
