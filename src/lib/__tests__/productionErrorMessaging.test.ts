import fs from 'fs';
import path from 'path';

function sourceFiles(root: string): string[] {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return /\.(tsx?|jsx?)$/.test(entry.name) && !entry.name.includes('.test.') ? [fullPath] : [];
  });
}

describe('production error messaging', () => {
  test('does not render support codes anywhere in application UI source', () => {
    const uiRoots = [
      path.resolve(__dirname, '../../components'),
      path.resolve(__dirname, '../../pages'),
    ];
    const offenders = uiRoots
      .flatMap(sourceFiles)
      .filter((file) => /support\s+code\s*:/i.test(fs.readFileSync(file, 'utf8')));

    expect(offenders).toEqual([]);
  });

  test('signup UI does not contain refresh instructions or technical failure copy', () => {
    const signupSources = [
      path.resolve(__dirname, '../../pages/PilotProgramSignupPage.tsx'),
      path.resolve(__dirname, '../../components/pilot-program/PilotProgramSignupForm.tsx'),
    ].map((file) => fs.readFileSync(file, 'utf8')).join('\n');

    expect(signupSources).not.toMatch(/refresh (the browser|and try|the page)/i);
    expect(signupSources).not.toMatch(/postgres|netlify function|stack trace|HTTP [45]\d\d/i);
  });
});
