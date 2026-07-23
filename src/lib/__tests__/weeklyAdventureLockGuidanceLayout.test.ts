import fs from 'fs';
import path from 'path';
const read = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Weekly Adventures locked guidance layout', () => {
  it('removes the page-level guide from the Kid Play Weekly Adventures layout', () => {
    const panel = read('src/components/family-portal/panels/FamilyContinueLearningPanel.tsx');
    const hub = read('src/components/courage-in-the-dark/CourageInTheDarkAdventureHub.tsx');

    expect(panel).toContain('hideBaselineGuide={kidPlayShell}');
    expect(hub).toContain('baselineLocked && !hideBaselineGuide');
  });

  it('relocates the guidance and action into My Adventures', () => {
    const drawer = read('src/components/kid-play-shell/MyAdventuresDrawer.tsx');

    expect(drawer).toContain('Complete Your B-4 Check-In');
    expect(drawer).toContain(
      'Choose your B-4 companion to unlock your Focus Flame Journey.',
    );
    expect(drawer).toContain('Start Check-In');
  });
});
