import fs from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve(__dirname, '../../..');
const SOURCE_ROOT = path.join(REPO_ROOT, 'src');
const PROTECTED_FIELDS = [
  'program_code',
  'family_access_code',
  'facilitator_access_code',
] as const;

function listSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'build') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(fullPath));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('program identity write guards', () => {
  test('app code does not directly update pilot program access-code fields', () => {
    const offenders: string[] = [];
    const updatePattern =
      /\.from\((['"])pilot_programs\1\)[\s\S]{0,800}?\.update\(\s*\{([\s\S]*?)\}\s*\)/g;

    for (const file of listSourceFiles(SOURCE_ROOT)) {
      const relative = path.relative(REPO_ROOT, file);
      if (relative.endsWith('renamePilotProgramTransaction.ts')) continue;
      const source = fs.readFileSync(file, 'utf8');
      let match: RegExpExecArray | null;

      while ((match = updatePattern.exec(source))) {
        const updatePayload = match[2] ?? '';
        for (const field of PROTECTED_FIELDS) {
          if (new RegExp(`\\b${field}\\s*:`).test(updatePayload)) {
            offenders.push(`${relative}: direct ${field} update`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
