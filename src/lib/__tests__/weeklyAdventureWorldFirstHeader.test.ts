import fs from 'fs';
import path from 'path';

describe('Weekly Adventures world-first header', () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      'src/components/courage-in-the-dark/CourageInTheDarkAdventureHub.tsx',
    ),
    'utf8',
  );

  test.each(['Explore', 'Missions', 'Quests'])(
    'does not render the legacy standalone week header for %s in cinematic mode',
    () => {
      expect(source).toContain(
        'const hideWeekMetaHeader = cinematicAdventureMode || showCinematicSelector;',
      );
      expect(source).toContain('const weekMetaRow =');
      expect(source).toContain('hideWeekMetaHeader ? null');
    },
  );
});
