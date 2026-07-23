import {
  shouldUseImmediateShellAssign,
  shouldUseSoftShellNavigation,
} from '../kidShellNav';
import { preserveWeeklyAdventureSelectionSearch } from '../weeklyAdventureRouteContext';

describe('Kid Play shell soft navigation', () => {
  const weekly =
    '/play/session/session-1/weekly-adventures?view=explore&week=1';

  test('hard-loads query changes so visible content follows the URL', () => {
    expect(
      shouldUseSoftShellNavigation(
        weekly,
        '/play/session/session-1/weekly-adventures?view=missions&week=1',
      ),
    ).toBe(false);
    expect(
      shouldUseImmediateShellAssign(
        weekly,
        '/play/session/session-1/weekly-adventures?view=missions&week=1',
      ),
    ).toBe(true);
  });

  test('hard-loads changes between Kid Play modules to avoid stale content', () => {
    expect(
      shouldUseSoftShellNavigation(
        weekly,
        '/play/session/session-1/collections',
      ),
    ).toBe(false);
    expect(
      shouldUseImmediateShellAssign(
        weekly,
        '/play/session/session-1/collections',
      ),
    ).toBe(true);
  });

  test('hard-loads nested Arcade and character route changes', () => {
    expect(
      shouldUseSoftShellNavigation(
        '/play/session/session-1/arcade',
        '/play/session/session-1/arcade/b4-focus-flight',
      ),
    ).toBe(false);
    expect(
      shouldUseSoftShellNavigation(
        '/play/session/session-1/characters',
        '/play/session/session-1/characters/caiden',
      ),
    ).toBe(false);
  });

  test('does not soften navigation across sessions', () => {
    expect(
      shouldUseSoftShellNavigation(
        weekly,
        '/play/session/session-2/weekly-adventures?view=missions',
      ),
    ).toBe(false);
  });

  test('preserves only the Weekly Adventures selection across shell tabs', () => {
    expect(
      preserveWeeklyAdventureSelectionSearch(
        '?view=explore&month=2&week=5&character=miranda&debug=true',
      ),
    ).toBe('?view=explore&month=2&week=5');
  });

  test('returns no search string when there is no Weekly Adventures selection', () => {
    expect(preserveWeeklyAdventureSelectionSearch('?character=miranda')).toBe('');
  });
});
