import { useEffect, useRef } from 'react';

/**
 * Adds `.visible` when the element enters the viewport (pairs with `.fade-in-up` in index.css).
 */
export function useInViewReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      el.classList.add('visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px',
        ...options,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
