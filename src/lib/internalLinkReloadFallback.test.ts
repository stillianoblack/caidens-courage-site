import { shouldForceInternalLinkReload } from './internalLinkReloadFallback';

describe('installInternalLinkReloadFallback', () => {
  beforeEach(() => {
    window.__ccInternalLinkReloadFallbackInstalled = undefined;
    document.body.innerHTML = '';
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('force-loads route-changing links inside the kid play shell', () => {
    window.history.pushState({}, '', '/play/session/session-123/weekly-adventures');

    const link = document.createElement('a');
    link.href = '/play/session/session-123/kids/b4/mission-1';
    document.body.appendChild(link);

    expect(
      shouldForceInternalLinkReload(
        link,
        new URL(link.href),
        '/play/session/session-123/weekly-adventures',
      ),
    ).toBe(true);
  });

  it('does not force-load the current shell route', () => {
    window.history.pushState({}, '', '/play/session/session-123/weekly-adventures');

    const link = document.createElement('a');
    link.href = '/play/session/session-123/weekly-adventures';
    document.body.appendChild(link);

    expect(
      shouldForceInternalLinkReload(
        link,
        new URL(link.href),
        '/play/session/session-123/weekly-adventures',
      ),
    ).toBe(false);
  });
});
