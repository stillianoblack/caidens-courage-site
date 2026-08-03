import { useEffect, useRef, useState } from 'react';

function nextBlinkDelay(initial: boolean): number {
  if (initial) return 700 + Math.random() * 4300;
  const occasionalPause = Math.random() < 0.18 ? 2500 + Math.random() * 2500 : 0;
  return 4000 + Math.random() * 4000 + occasionalPause;
}

export function useB4Blink<T extends HTMLElement = HTMLElement>(enabled = true) {
  const rootRef = useRef<T | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
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
      setIsBlinking(false);
      return;
    }
    let blinkTimer: number | undefined;
    let openTimer: number | undefined;
    let cancelled = false;
    const schedule = (initial = false) => {
      blinkTimer = window.setTimeout(() => {
        if (cancelled) return;
        setIsBlinking(true);
        openTimer = window.setTimeout(() => {
          if (cancelled) return;
          setIsBlinking(false);
          schedule(false);
        }, 120 + Math.random() * 60);
      }, nextBlinkDelay(initial));
    };
    schedule(true);
    return () => {
      cancelled = true;
      if (blinkTimer) window.clearTimeout(blinkTimer);
      if (openTimer) window.clearTimeout(openTimer);
    };
  }, [enabled, isVisible, pageVisible, reduceMotion]);

  return { rootRef, isBlinking, reduceMotion };
}
