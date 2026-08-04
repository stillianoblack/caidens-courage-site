import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import B4AnimatedImage from './B4AnimatedImage';

describe('B4AnimatedImage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('uses a fixed host-sized contain stage and opacity-only blink overlay', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const { container } = render(
      <B4AnimatedImage
        assetType="full-body"
        idleSrc="/idle.png"
        blinkSrc="/blink.png"
        floatProfile={{ travelPx: 7, durationSeconds: 8, delaySeconds: -3 }}
      />,
    );
    fireEvent.load(container.querySelector('.b4-animatedImageFrame--idle')!);
    fireEvent.load(container.querySelector('.b4-animatedImageFrame--blink')!);
    act(() => jest.advanceTimersByTime(7751));
    expect(container.querySelector('.b4-animatedImage')).toHaveAttribute('data-blink-phase', 'closing');
    const css = fs.readFileSync(path.join(process.cwd(), 'src/components/b4/b4-animated-image.css'), 'utf8');
    const frameRule = css.match(/\.b4-animatedImageFrame\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(frameRule).toContain('object-fit: contain');
    expect(frameRule).not.toMatch(/transform|scale/);
    expect(css).toContain('transition: opacity 50ms ease-in');
    const floatKeyframes = css.match(/@keyframes b4-image-float\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(floatKeyframes).not.toMatch(/width|height|scale/);
  });

  test('keeps floating independent per host and cleans timers on unmount', () => {
    const clearSpy = jest.spyOn(window, 'clearTimeout');
    const { container, unmount } = render(
      <B4AnimatedImage
        assetType="head"
        idleSrc="/idle.png"
        blinkSrc="/blink.png"
        floatProfile={{ travelPx: 6, durationSeconds: 7.4, delaySeconds: -4.1 }}
      />,
    );
    const root = container.querySelector<HTMLElement>('.b4-animatedImage');
    expect(root?.style.getPropertyValue('--b4-image-float-delay')).toBe('-4.1s');
    fireEvent.load(container.querySelector('.b4-animatedImageFrame--idle')!);
    fireEvent.load(container.querySelector('.b4-animatedImageFrame--blink')!);
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
