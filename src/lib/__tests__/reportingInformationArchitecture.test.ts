import fs from 'fs';
import path from 'path';

describe('reporting information architecture', () => {
  const academy = fs.readFileSync(
    path.join(process.cwd(), 'src/components/admin/AdminAcademyOverview.tsx'),
    'utf8',
  );
  const program = fs.readFileSync(
    path.join(process.cwd(), 'src/components/admin/tabs/AdminPilotOutcomesTab.tsx'),
    'utf8',
  );
  const styles = fs.readFileSync(
    path.join(process.cwd(), 'src/components/admin/admin-academy-overview.css'),
    'utf8',
  );

  test('uses Academy, program, and student scope labels and specific actions', () => {
    expect(academy).toContain('Program Reporting Summary');
    expect(academy).toContain('View Program Report');
    expect(academy).toContain('Generate Program Report');
    expect(academy).toContain('Download Program PDF');
    expect(academy).toContain('Student-level');
    expect(program).toContain('Academy and Program Reporting');
    expect(program).toContain('Back to Academy Overview');
    expect(program).not.toContain('Back to portfolio');
  });

  test('collapses by program and expands students into cohort groups', () => {
    expect(academy).toContain("const [expandedPrograms");
    expect(academy).toContain("aria-expanded={expanded}");
    expect(academy).toContain("['established', 'emerging', 'minimal', 'test_internal']");
    expect(academy).toContain('Reporting override');
    expect(academy).toContain('Internal reason');
  });

  test('renders readable program names once per collapsed program summary', () => {
    expect(academy).toContain('<h4>{summary.programName}</h4>');
    expect(academy).toContain('{summary.programCode}');
    const programCard = academy.slice(academy.indexOf('<h4>{summary.programName}</h4>'));
    expect(programCard.indexOf('{summary.programName}'))
      .toBeLessThan(programCard.indexOf('{summary.programCode}'));
    expect(academy).not.toContain('<strong>{row.programName}</strong>');
  });

  test('uses mobile program cards and prevents horizontal overflow', () => {
    expect(styles).toContain('@media (max-width: 760px)');
    expect(styles).toContain('.academyOverview-programTable tr { border: 1px solid');
    expect(styles).toContain('.academyOverview-cohortRow { grid-template-columns: 1fr; overflow: hidden; }');
  });
});
