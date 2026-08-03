import { useEffect, useRef, useState } from 'react';

export type B4BlinkPhase = 'open' | 'closing' | 'closed' | 'opening';

let lastB4BlinkStartedAt = Number.NEGATIVE_INFINITY;

export function nextB4BlinkDelay(random: () => number = Math.random): number {
  return random() < 0.12
    ? 11000 + random() * 4000
    : 5500 + random() * 4500;
}

export function useB4Blink<T extends HTMLElement = HTMLElement>(enabled = true) {
  const rootRef = useRef<T | null>(null);
  const [blinkPhase, setBlinkPhase] = useState<B4BlinkPhase>('open');
  const [isVisible, setIsVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) {
      setReduceMotion(false);
      return;
    }
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: '80px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled || reduceMotion || !pageVisible || !isVisible) {
      setBlinkPhase('open');
      return;
    }
    const timers = new Set<number>();
    let cancelled = false;

    const later = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };

    const beginBlink = () => {
      if (cancelled) return;
      const now = Date.now();
      const sincePreviousBlink = now - lastB4BlinkStartedAt;
      if (sincePreviousBlink < 350) {
        later(beginBlink, 350 - sincePreviousBlink + Math.random() * 150);
        return;
      }
      lastB4BlinkStartedAt = now;
      const closingMs = 50;
      const closedMs = 80 + Math.random() * 40;
      const openingMs = 60;
      setBlinkPhase('closing');
      later(() => {
        if (cancelled) return;
        setBlinkPhase('closed');
        later(() => {
          if (cancelled) return;
          setBlinkPhase('opening');
          later(() => {
            if (cancelled) return;
            setBlinkPhase('open');
            schedule();
          }, openingMs);
        }, closedMs);
      }, closingMs);
    };

    const schedule = () => {
      later(beginBlink, nextB4BlinkDelay());
    };
    schedule();
    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, [enabled, isVisible, pageVisible, reduceMotion]);

  return { rootRef, blinkPhase, isBlinking: blinkPhase !== 'open', reduceMotion };
}
