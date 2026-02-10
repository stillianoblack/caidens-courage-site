import React, { useEffect } from 'react';

const TARGET_FPS = 25;
const TICK_MS = 1000 / TARGET_FPS;
const AMPLITUDE_PX = 6;
const PERIOD_SEC = 8;

/**
 * Gates .circle-accent and .animate-float so they only animate when:
 * - element is in view (IntersectionObserver), OR
 * - user has interacted (click, scroll, keydown, touch).
 * Runs a 24–30 FPS JS loop (not 60), pauses when tab is inactive, cleans up on unmount.
 * Lazy-loaded and mounted only after the page is interactive (see App.tsx).
 */
interface FloatingAnimationControllerProps {
  pathname: string;
}

const FloatingAnimationController: React.FC<FloatingAnimationControllerProps> = ({ pathname }) => {
  useEffect(() => {
    if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    let cancelled = false;
    const selector = '.circle-accent, .animate-float';
    const inView = new Set<Element>();
    let userHasInteracted = false;
    let tickId: ReturnType<typeof setInterval> | null = null;
    let observer: IntersectionObserver | null = null;
    const observed: Element[] = [];
    const startTime = Date.now();

    const getPhase = (el: Element): number => {
      const elHtml = el as HTMLElement;
      const delayStyle = elHtml.style?.animationDelay;
      const match = typeof delayStyle === 'string' && delayStyle ? delayStyle.match(/^([\d.]+)s$/) : null;
      const sec = match ? parseFloat(match[1]) : 0;
      return (sec / PERIOD_SEC) * Math.PI * 2;
    };

    const runTick = () => {
      if (cancelled || document.hidden) return;
      const t = (Date.now() - startTime) / 1000;
      const base = (t * (Math.PI * 2)) / PERIOD_SEC;
      inView.forEach((el) => {
        const phase = getPhase(el);
        const y = AMPLITUDE_PX * Math.sin(base + phase);
        (el as HTMLElement).style.transform = `translateY(${y}px)`;
      });
    };

    const maybeStartLoop = () => {
      if (cancelled || document.hidden || tickId !== null) return;
      if (inView.size === 0 && !userHasInteracted) return;
      tickId = setInterval(runTick, TICK_MS);
    };

    const stopLoop = () => {
      if (tickId !== null) {
        clearInterval(tickId);
        tickId = null;
      }
      inView.forEach((el) => {
        (el as HTMLElement).style.transform = '';
      });
    };

    const onInteraction = () => {
      if (userHasInteracted) return;
      userHasInteracted = true;
      maybeStartLoop();
    };

    const onVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else maybeStartLoop();
    };

    const run = () => {
      if (cancelled) return;
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          if (cancelled) return;
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              inView.add(entry.target);
            } else {
              inView.delete(entry.target);
              (entry.target as HTMLElement).style.transform = '';
            }
            if (document.hidden) return;
            if (inView.size > 0 || userHasInteracted) maybeStartLoop();
            else stopLoop();
          });
        },
        { rootMargin: '20px', threshold: 0 }
      );

      elements.forEach((el) => {
        observed.push(el);
        observer!.observe(el);
      });

      ['click', 'scroll', 'keydown', 'touchstart'].forEach((ev) => {
        document.addEventListener(ev, onInteraction, { once: true, passive: true });
      });

      document.addEventListener('visibilitychange', onVisibilityChange);
      maybeStartLoop();
    };

    let idleOrTimeoutId: number | undefined;
    const scheduleRun = () => {
      if (cancelled) return;
      if (typeof (window as any).requestIdleCallback !== 'undefined') {
        idleOrTimeoutId = (window as any).requestIdleCallback(run, { timeout: 400 });
      } else {
        idleOrTimeoutId = window.setTimeout(run, 200) as unknown as number;
      }
    };
    const timeoutId = window.setTimeout(scheduleRun, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (idleOrTimeoutId != null && typeof (window as any).cancelIdleCallback !== 'undefined') {
        (window as any).cancelIdleCallback(idleOrTimeoutId);
      } else if (idleOrTimeoutId != null) {
        window.clearTimeout(idleOrTimeoutId);
      }
      stopLoop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      ['click', 'scroll', 'keydown', 'touchstart'].forEach((ev) => {
        document.removeEventListener(ev, onInteraction);
      });
      observed.forEach((el) => {
        (el as HTMLElement).style.transform = '';
      });
      inView.clear();
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
};

export default FloatingAnimationController;
