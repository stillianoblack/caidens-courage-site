import './pageTransition.css';

const TRANSITION_ID = 'cc-page-transition';
const GENESIS_MARK_SRC = '/images/icons/Genesis@4x-100.webp';
const TRANSITION_DELAY_MS = 170;

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
      <div class="cc-pageTransitionMark" aria-hidden="true">
        <img src="${GENESIS_MARK_SRC}" alt="" decoding="async" />
      </div>
    `;
    document.body.appendChild(overlay);
  }

  window.requestAnimationFrame(() => {
    overlay?.setAttribute('data-active', 'true');
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
