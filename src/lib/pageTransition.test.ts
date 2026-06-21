import { showPageTransition } from './pageTransition';

describe('showPageTransition', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  it('renders the Focus Flame transition mark before hard navigation', () => {
    expect(showPageTransition()).toBeGreaterThan(0);

    const overlay = document.getElementById('cc-page-transition');
    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute('data-active')).toBe('true');
    expect(overlay?.querySelector('img')?.getAttribute('src')).toContain('focus-flame-mark.svg');
    expect(overlay?.querySelector('img')?.classList.contains('focusFlameMark')).toBe(true);
  });

  it('does not animate for reduced motion users', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });

    expect(showPageTransition()).toBe(0);
    expect(document.getElementById('cc-page-transition')).toBeNull();
  });
});
