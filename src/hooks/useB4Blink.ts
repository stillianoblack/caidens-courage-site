import { useEffect, useRef, useState } from 'react';

export type B4BlinkPhase = 'open' | 'closing' | 'closed' | 'opening';

export function nextB4BlinkDelay(random: () => number = Math.random): number {
  return random() < 0.12
    ? 10000 + random() * 4000
    : 4500 + random() * 4500;
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

    const schedule = () => {
      later(() => {
        if (cancelled) return;
        const closingMs = 140 + Math.random() * 40;
        const closedMs = 140 + Math.random() * 60;
        const openingMs = 160 + Math.random() * 50;
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
      }, nextB4BlinkDelay());
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
