import React from 'react';
import { act, render, screen } from '@testing-library/react';
import B4AnimatedHead from './B4AnimatedHead';
import fs from 'fs';
import path from 'path';

function setReducedMotion(matches: boolean) {
  window.matchMedia = jest.fn().mockReturnValue({
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
}

describe('B4AnimatedHead', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setReducedMotion(false);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('uses an approved closed-eye frame without layout replacement', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const { container } = render(<B4AnimatedHead variant="orange" alt="B-4 facilitator guide" />);
    expect(screen.getByAltText('B-4 facilitator guide')).toHaveAttribute(
      'src',
      '/assets/b4/anchor/idle/b4-anchor-idle.png',
    );
    expect(container.querySelector('.b4-animatedHeadFrame--closed')).toHaveAttribute(
      'src',
      '/assets/b4/anchor/blinking/b4-anchor-blinking.png',
    );
    act(() => jest.advanceTimersByTime(701));
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-blinking', 'true');
    act(() => jest.advanceTimersByTime(181));
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-blinking', 'false');
  });

  it('stays static when reduced motion is requested', () => {
    setReducedMotion(true);
    const { container } = render(<B4AnimatedHead />);
    act(() => jest.advanceTimersByTime(20_000));
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-blinking', 'false');
  });

  it('cleans up its blink timer on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    const { unmount } = render(<B4AnimatedHead />);
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('does not impose presentation dimensions on its host', () => {
    const css = fs.readFileSync(path.join(process.cwd(), 'src/components/b4/b4-animated-head.css'), 'utf8');
    const rootRule = css.match(/\.b4-animatedHead\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rootRule).not.toMatch(/\bwidth\s*:/);
    expect(rootRule).not.toMatch(/\bheight\s*:/);
    expect(rootRule).not.toMatch(/\baspect-ratio\s*:/);
  });
});
