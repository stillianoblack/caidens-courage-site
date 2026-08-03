import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import B4AnimatedHead from './B4AnimatedHead';
import { nextB4BlinkDelay } from '../../hooks/useB4Blink';
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

  const loadBothFrames = (container: HTMLElement) => {
    fireEvent.load(container.querySelector('.b4-animatedHeadFrame--open')!);
    fireEvent.load(container.querySelector('.b4-animatedHeadFrame--closed')!);
  };

  it('uses the approved matched idle and blink assets as a quick frame swap', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const { container } = render(<B4AnimatedHead variant="orange" alt="B-4 facilitator guide" />);
    expect(screen.getByAltText('B-4 facilitator guide')).toHaveAttribute(
      'src',
      '/assets/b4/anchor/idle/b4-anchor-idle.png',
    );
    expect(container.querySelector('.b4-animatedHeadFrame--closed')).toHaveAttribute(
      'src',
      '/assets/b4/anchor/blinking/b4-anchor-blinking.png',
    );
    expect(container.querySelectorAll('.b4-animatedHeadFrame')).toHaveLength(2);
    loadBothFrames(container);
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-assets-ready', 'true');
    act(() => jest.advanceTimersByTime(7751));
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-blink-phase', 'closing');
    act(() => jest.advanceTimersByTime(51));
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-blink-phase', 'closed');
    act(() => jest.advanceTimersByTime(101));
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-blink-phase', 'opening');
    act(() => jest.advanceTimersByTime(61));
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-blink-phase', 'open');
  });

  it('does not schedule the first blink until both frames have loaded', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const { container } = render(<B4AnimatedHead />);
    fireEvent.load(container.querySelector('.b4-animatedHeadFrame--open')!);
    act(() => jest.advanceTimersByTime(20_000));
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-blink-phase', 'open');
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-assets-ready', 'false');
    fireEvent.load(container.querySelector('.b4-animatedHeadFrame--closed')!);
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-assets-ready', 'true');
  });

  it('stays static when reduced motion is requested', () => {
    setReducedMotion(true);
    const { container } = render(<B4AnimatedHead />);
    act(() => jest.advanceTimersByTime(20_000));
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-blink-phase', 'open');
  });

  it('cleans up its blink timer on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    const { container, unmount } = render(<B4AnimatedHead />);
    loadBothFrames(container);
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

  it('keeps the idle and blink frames inside one fixed-size stage', () => {
    const { container } = render(<B4AnimatedHead />);
    const stage = container.querySelector('.b4-animatedHeadStage');
    expect(stage?.querySelectorAll('.b4-animatedHeadFrame--open')).toHaveLength(1);
    expect(stage?.querySelectorAll('.b4-animatedHeadFrame--closed')).toHaveLength(1);
    const css = fs.readFileSync(path.join(process.cwd(), 'src/components/b4/b4-animated-head.css'), 'utf8');
    const frameRule = css.match(/\.b4-animatedHeadFrame\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(frameRule).toContain('position: absolute');
    expect(frameRule).toContain('inset: 0');
    expect(frameRule).toContain('width: 100%');
    expect(frameRule).toContain('height: 100%');
    expect(frameRule).toContain('object-fit: contain');
    expect(frameRule).not.toMatch(/\btransform\s*:/);
    expect(frameRule).not.toMatch(/\bscale\s*:/);
    expect(container.querySelector('.b4-animatedHeadFrame--open')).toBeVisible();
    expect(container.querySelectorAll('.b4-animatedHeadFrame--closed')).toHaveLength(1);
    const closedRule = css.match(/\.b4-animatedHeadFrame--closed\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(closedRule).toContain('opacity: 0');
    expect(closedRule).not.toMatch(/\btransform\s*:/);
    expect(css).not.toContain('b4-animatedHeadEyelid');
    expect(css).toContain('transition: opacity 50ms ease-in');
    expect(css).toContain('transition: opacity 60ms ease-out');
  });

  it('applies stable per-instance floating variables outside the blink stage', () => {
    const { container } = render(
      <B4AnimatedHead floatProfile={{ travelPx: 11, durationSeconds: 7.1, delaySeconds: -3.4 }} />,
    );
    const root = container.querySelector('.b4-animatedHead');
    const rootWithProfile = container.querySelector<HTMLElement>('.b4-animatedHead');
    expect(root).toHaveAttribute('data-floating', 'true');
    expect(rootWithProfile?.style.getPropertyValue('--b4-float-travel')).toBe('11px');
    expect(rootWithProfile?.style.getPropertyValue('--b4-float-duration')).toBe('7.1s');
    expect(rootWithProfile?.style.getPropertyValue('--b4-float-delay')).toBe('-3.4s');
    expect(container.querySelector('.b4-animatedHeadShadow')).toBeInTheDocument();
  });

  it('keeps regular hosts static unless a floating profile is supplied', () => {
    const { container } = render(<B4AnimatedHead />);
    expect(container.querySelector('.b4-animatedHead')).toHaveAttribute('data-floating', 'false');
  });

  it('keeps randomized delays inside the normal and extended bounds', () => {
    expect(nextB4BlinkDelay(() => 0.5)).toBe(7750);
    const longValues = [0.05, 0.75];
    expect(nextB4BlinkDelay(() => longValues.shift() ?? 0)).toBe(14000);
  });

  it('disables continuous floating for reduced motion', () => {
    const css = fs.readFileSync(path.join(process.cwd(), 'src/components/b4/b4-animated-head.css'), 'utf8');
    const reducedMotion = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(reducedMotion).toContain('.b4-animatedHeadFloat { animation: none; transform: none; }');
  });

  it('is constrained by a separate clipping frame in the facilitator guide', () => {
    const guide = fs.readFileSync(
      path.join(process.cwd(), 'src/components/pilot-dashboard/coach/FacilitatorProgramCoachPanel.tsx'),
      'utf8',
    );
    const guideCss = fs.readFileSync(
      path.join(process.cwd(), 'src/components/pilot-dashboard/coach/facilitator-program-coach.css'),
      'utf8',
    );
    expect(guide).toContain('<span className="pilot-programCoachAvatar pilot-programCoachAvatar--guide">');
    expect(guide).toContain('className="pilot-programCoachAvatarImage"');
    expect(guideCss).toContain('overflow: hidden;');
    expect(guideCss).toContain('box-sizing: border-box;');
  });
});
