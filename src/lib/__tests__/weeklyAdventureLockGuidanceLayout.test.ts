import fs from 'fs';
import path from 'path';
import { BASELINE_GATE_MESSAGE } from '../launchWeeklyMission';

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Weekly Adventures locked guidance layout', () => {
  it('uses the approved Focus Flame Journey guidance copy', () => {
    expect(BASELINE_GATE_MESSAGE).toBe(
      'Complete your B-4 Check-In to unlock your Focus Flame Journey.',
    );
  });

  it('renders the guidance before the mobile and desktop mission-card regions', () => {
    const source = read(
      'src/components/courage-in-the-dark/CourageInTheDarkAdventureHub.tsx',
    );
    const guideIndex = source.indexOf('{baselineHelper}');
    const mobileCardsIndex = source.indexOf('{isMobileLayout ? (', guideIndex);
    const desktopCardsIndex = source.indexOf('courageAdventureHubSplit', guideIndex);

    expect(guideIndex).toBeGreaterThan(-1);
    expect(mobileCardsIndex).toBeGreaterThan(guideIndex);
    expect(desktopCardsIndex).toBeGreaterThan(guideIndex);
    expect(source.match(/\{baselineHelper\}/g)).toHaveLength(1);
  });

  it('keeps the guidance outside scrolling tracks with responsive readable styling', () => {
    const source = read(
      'src/components/courage-in-the-dark/CourageInTheDarkAdventureHub.tsx',
    );
    const css = read('src/components/courage-in-the-dark/courage-adventure-hub.css');

    expect(source).toContain('className="courageAdventureHubBaselineGuide"');
    expect(css).toMatch(/\.courageAdventureHubBaselineGuide\s*\{[\s\S]*text-align:\s*left/);
    expect(css).toMatch(/\.courageAdventureHubBaselineGuide\s*\{[\s\S]*white-space:\s*normal/);
    expect(css).toMatch(/\.courageAdventureHubBaselineGuide\s*\{[\s\S]*margin:\s*1rem 0 1\.75rem/);
    expect(source.indexOf('{baselineHelper}', source.indexOf('courageAdventureHubMapCol'))).toBeGreaterThan(-1);
  });
});
