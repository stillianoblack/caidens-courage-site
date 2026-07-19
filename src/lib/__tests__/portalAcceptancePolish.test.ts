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

  it('gives Flight results a native return link to the canonical Arcade route', () => {
    const flight = read('src/games/b4-focus-flight/B4FocusFlightPage.tsx');
    const shell = read('src/games/b4-focus-flight/components/GameShell.tsx');
    const results = read('src/games/b4-focus-flight/components/GameResults.tsx');

    expect(flight).toContain("import { kidPlayShellNavigate } from '../../lib/kidShellNav'");
    expect(flight).toContain('kidPlayShellNavigate(navigate, exitPath)');
    expect(flight).toContain('exitHref={exitPath}');
    expect(shell).toContain('exitHref={exitHref}');
    expect(results).toContain('href={exitHref}');
    expect(flight).not.toContain('window.location.reload');
  });

  it('hard-loads facilitator learning previews so URL and visible route cannot diverge', () => {
    const trackCard = read('src/components/pilot-dashboard/CharacterLearningTrackCard.tsx');

    expect(trackCard).toContain('window.location.assign(previewHref)');
    expect(trackCard).not.toContain('navigate(previewHref)');
  });

  it('centers the mobile B-4 profile layer inside the dynamic safe-area viewport', () => {
    const css = read('src/components/kid-play-shell/kid-play-shell-nav.css');

    expect(css).toContain('.kidPlayB4ProfileMenuLayer');
    expect(css).toContain('place-items: center');
    expect(css).toContain('env(safe-area-inset-top)');
    expect(css).toContain('env(safe-area-inset-bottom)');
    expect(css).toContain('100dvh');
  });
});
