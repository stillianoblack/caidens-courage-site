import fs from 'fs';
import path from 'path';

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('portal acceptance polish', () => {
  it('keeps the Kid Arcade free of the redundant generic onboarding banner', () => {
    const arcade = read('src/components/kid-play-shell/KidArcadePanel.tsx');

    expect(arcade).toContain('Kid Arcade');
    expect(arcade).toContain('useB4Variant');
    expect(arcade).not.toMatch(/Ready to build your Focus Flame/i);
    expect(arcade).not.toMatch(/Here are your first adventures/i);
    expect(arcade).not.toMatch(/Start your first mission/i);
  });

  it('leads the Family Hub with the weekly challenge and preserves the B-4 journey', () => {
    const overview = read('src/components/family-portal/panels/FamilyOverviewPanel.tsx');
    const weeklyChallengeIndex = overview.indexOf('<FamilyWeeklyAdventureCtaBanner />');
    const journeyIndex = overview.indexOf('<FamilyJourneyCoachInline />');

    expect(weeklyChallengeIndex).toBeGreaterThan(-1);
    expect(journeyIndex).toBeGreaterThan(weeklyChallengeIndex);
    expect(overview).not.toMatch(/Welcome to your Family Hub/i);
    expect(overview).not.toMatch(/Start with one small step/i);
    expect(overview).not.toMatch(/Review progress and rewards/i);
  });

  it('routes Flight results through the canonical kid-shell navigation helper', () => {
    const flight = read('src/games/b4-focus-flight/B4FocusFlightPage.tsx');

    expect(flight).toContain("import { kidPlayShellNavigate } from '../../lib/kidShellNav'");
    expect(flight).toContain('kidPlayShellNavigate(navigate, exitPath)');
    expect(flight).not.toContain('window.location.reload');
  });
});
