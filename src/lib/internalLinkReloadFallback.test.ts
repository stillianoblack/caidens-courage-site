import { installInternalLinkReloadFallback } from './internalLinkReloadFallback';

describe('installInternalLinkReloadFallback', () => {
  beforeEach(() => {
    window.__ccInternalLinkReloadFallbackInstalled = undefined;
    document.body.innerHTML = '';
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does not force reloads for links inside the kid play shell', () => {
    window.history.pushState({}, '', '/play/session/session-123/weekly-adventures');

    installInternalLinkReloadFallback();

    const link = document.createElement('a');
    link.href = '/play/session/session-123/kids/b4/mission-1';
    document.body.appendChild(link);

    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
    });

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
