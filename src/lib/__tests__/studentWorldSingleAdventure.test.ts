import fs from 'fs';
import path from 'path';
import { normalizeWeeklyAdventureWorldLocation } from '../weeklyAdventureRouteContext';

const repoRoot = path.resolve(__dirname, '../../..');
const read = (relativePath: string) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const panel = read('src/components/family-portal/panels/FamilyContinueLearningPanel.tsx');
const hub = read('src/components/courage-in-the-dark/CourageInTheDarkAdventureHub.tsx');
const nav = read('src/components/kid-play-shell/KidPlayShellNav.tsx');
const drawer = read('src/components/kid-play-shell/MyAdventuresDrawer.tsx');
const rewardSnapshot = read('src/lib/childRewardCompletionSnapshot.ts');

describe('single character-led Weekly Adventures world', () => {
  test.each(['missions', 'quests', 'activities', 'map', 'list'])(
    'normalizes the legacy %s view without losing selection',
    (view) => {
      expect(
        normalizeWeeklyAdventureWorldLocation(`?view=${view}&month=2&week=6`, '#missions'),
      ).toEqual({
        search: '?view=explore&month=2&week=6',
        hash: '',
        changed: true,
      });
    },
  );

  test('keeps the canonical world stable for hard refresh and history replay', () => {
    expect(
      normalizeWeeklyAdventureWorldLocation('?view=explore&month=2&week=6', '#week-hero-6'),
    ).toEqual({
      search: '?view=explore&month=2&week=6',
      hash: '#week-hero-6',
      changed: false,
    });
    expect(panel).toContain('{ replace: true }');
  });

  test('does not mount or prefetch the standalone quest contract', () => {
    expect(panel).not.toContain('useParticipantQuests');
    expect(panel).not.toContain('questPanel=');
    expect(panel).not.toContain('Loading quests');
    expect(rewardSnapshot).not.toContain("from './participantQuestService'");
    expect(hub).not.toContain('CourageQuestListPanel');
    expect(hub).not.toContain('CourageHubHudQuestStrip');
  });

  test('renders the student shell in the single world and preserves canonical launches', () => {
    expect(panel).toContain('singleAdventurePresentation={kidPlayShell}');
    expect(hub).toContain("launchMission(mission, 'character-hotspot')");
    expect(hub).toContain('onWeekSelectorLaunchWeek?.(weekNumber, source)');
    expect(hub).toContain('CourageHubHudExploreWeekStrip');
  });

  test('places B-4, coins, sound, and exit together in the persistent utility cluster', () => {
    const b4 = nav.indexOf('<KidPlayB4ProfileControl');
    const coins = nav.indexOf('<FocusCoinWalletBadge');
    const sound = nav.indexOf('<CourageHubSoundToggle');
    const exit = nav.indexOf('className="kidPlayShellPowerBtn"');
    expect(b4).toBeGreaterThan(-1);
    expect(coins).toBeGreaterThan(b4);
    expect(sound).toBeGreaterThan(coins);
    expect(exit).toBeGreaterThan(sound);
    expect(nav).toContain('aria-label="Kid play modules"');
  });

  test('uses My Adventures for supported progress and a deliberate future-goals state', () => {
    expect(drawer).toContain('Current adventure');
    expect(drawer).toContain('Continue Adventure');
    expect(drawer).toContain('More goals coming soon');
    expect(drawer).toContain('Completed adventures');
    expect(drawer).not.toContain('Loading quests');
  });
});
