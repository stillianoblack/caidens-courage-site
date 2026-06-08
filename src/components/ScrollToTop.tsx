import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_CONTAINER_SELECTORS = [
  '.portal-contentFrame',
  '.portal-shellMain',
  '.family-content',
  '.pilot-content',
  '.bbc-main',
  '.bbc-main--quiz',
  'main',
].join(', ');

function resetScrollPositions(): void {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  document.querySelectorAll(SCROLL_CONTAINER_SELECTORS).forEach((node) => {
    const el = node as HTMLElement;
    el.scrollTop = 0;
  });
}

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    resetScrollPositions();
    const frame = window.requestAnimationFrame(resetScrollPositions);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash, key]);

  return null;
}
