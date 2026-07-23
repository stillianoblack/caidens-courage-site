import {
  shouldUseImmediateShellAssign,
  shouldUseSoftShellNavigation,
} from '../kidShellNav';

describe('Kid Play shell soft navigation', () => {
  const weekly =
    '/play/session/session-1/weekly-adventures?view=explore&week=1';

  test('uses router navigation for tab query changes inside the same module', () => {
    expect(
      shouldUseSoftShellNavigation(
        weekly,
        '/play/session/session-1/weekly-adventures?view=missions&week=1',
      ),
    ).toBe(true);
  });

  test('uses router navigation for changes between Kid Play modules', () => {
    expect(
      shouldUseSoftShellNavigation(
        weekly,
        '/play/session/session-1/collections',
      ),
    ).toBe(true);
    expect(
      shouldUseImmediateShellAssign(
        weekly,
        '/play/session/session-1/collections',
      ),
    ).toBe(true);
  });

  test('does not soften navigation across sessions', () => {
    expect(
      shouldUseSoftShellNavigation(
        weekly,
        '/play/session/session-2/weekly-adventures?view=missions',
      ),
    ).toBe(false);
  });
});
