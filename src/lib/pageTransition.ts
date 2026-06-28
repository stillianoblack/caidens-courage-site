import './pageTransition.css';
import { FOCUS_FLAME_ICON_SRC } from '../design-system/brand/brandLogos';

const TRANSITION_ID = 'cc-page-transition';
const TRANSITION_DELAY_MS = 170;
const TRANSITION_RECOVERY_MS = 6500;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function showPageTransition(): number {
  if (typeof document === 'undefined' || prefersReducedMotion()) return 0;

  let overlay = document.getElementById(TRANSITION_ID);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = TRANSITION_ID;
    overlay.className = 'cc-pageTransition';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-label', 'Opening next adventure');
    overlay.innerHTML = `
      <img class="focusFlameMark focusFlameMark--animate" src="${FOCUS_FLAME_ICON_SRC}" alt="" decoding="async" />
      <div class="cc-pageTransitionRecovery" role="alert">
        <p>We&apos;re having trouble loading this page.</p>
        <div class="cc-pageTransitionActions">
          <button type="button" data-page-transition-refresh>Refresh</button>
          <a href="/portal">Open Portal</a>
        </div>
      </div>
    `;
    overlay
      .querySelector('[data-page-transition-refresh]')
      ?.addEventListener('click', () => window.location.reload());
    document.body.appendChild(overlay);
  }

  if (!overlay) return 0;

  const overlayElement = overlay;

  overlayElement.removeAttribute('data-recovering');
  window.setTimeout(() => {
    if (!document.body.contains(overlayElement)) return;
    overlayElement.setAttribute('data-recovering', 'true');
  }, TRANSITION_RECOVERY_MS);

  window.requestAnimationFrame(() => {
    overlayElement.setAttribute('data-active', 'true');
  });

  return TRANSITION_DELAY_MS;
}

export function navigateWithPageTransition(
  path: string,
  mode: 'assign' | 'replace' = 'assign',
): void {
  if (typeof window === 'undefined') return;

  const href = new URL(path, window.location.origin).href;
  const delay = showPageTransition();
  const navigate = () => {
    if (mode === 'replace') {
      window.location.replace(href);
      return;
    }
    window.location.assign(href);
  };

  if (delay <= 0) {
    navigate();
    return;
  }

  window.setTimeout(navigate, delay);
}

export function clearPageTransitionOverlay(): void {
  if (typeof document === 'undefined') return;
  document.getElementById(TRANSITION_ID)?.remove();
}
