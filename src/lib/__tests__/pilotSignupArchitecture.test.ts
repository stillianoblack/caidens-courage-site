import fs from 'fs';
import path from 'path';

describe('pilot signup architecture guard', () => {
  test('React client code never inserts into pilot_programs', () => {
    const srcRoot = path.resolve(process.cwd(), 'src');
    const files: string[] = [];
    const visit = (directory: string) => {
      fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) visit(target);
        else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts')) {
          files.push(target);
        }
      });
    };
    visit(srcRoot);

    const offenders = files.filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return /from\(['"]pilot_programs['"]\)[\s\S]{0,240}\.insert\(/.test(source);
    });
    expect(offenders).toEqual([]);
  });

  test('all public signup types are handled by the server pipeline', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'netlify/functions/pilot-family-signup.js'),
      'utf8',
    );
    [
      'Camp / Youth Program',
      'Teacher / Classroom',
      'After-School Program',
      'School',
      'District',
      'Homeschool Group',
      'independent_family',
      'camp_parent_program',
    ].forEach((programType) => expect(source).toContain(programType));
  });
});
