import {
  isStripeCheckoutUrl,
  paymentLinkCheckoutAllowed,
  stripeAssignIsAllowed,
} from './checkoutEnvironment';

let installed = false;
let originalAssign: ((url: string | URL) => void) | null = null;

function stripeHref(anchor: HTMLAnchorElement): string {
  return anchor.getAttribute('href') || anchor.href || '';
}

export function blockStripeNavigationEvent(event: Event): void {
  if (paymentLinkCheckoutAllowed()) return;
  const target = event.target instanceof Element ? event.target : null;
  const anchor = target?.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (!isStripeCheckoutUrl(stripeHref(anchor))) return;
  event.preventDefault();
  event.stopPropagation();
}

export function installCheckoutNavigationGuard(): void {
  if (installed || typeof window === 'undefined' || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('click', blockStripeNavigationEvent, true);
  document.addEventListener('auxclick', blockStripeNavigationEvent, true);

  const originalOpen = window.open.bind(window);
  window.open = ((url?: string | URL, target?: string, features?: string) => {
    const value = typeof url === 'string' ? url : url?.toString() || '';
    if (value && isStripeCheckoutUrl(value) && !paymentLinkCheckoutAllowed()) return null;
    return originalOpen(url as string, target, features);
  }) as typeof window.open;

  try {
    originalAssign = window.location.assign.bind(window.location);
    window.location.assign = ((url: string | URL) => {
      const value = typeof url === 'string' ? url : url.toString();
      if (!stripeAssignIsAllowed(value)) return;
      originalAssign?.(url);
    }) as Location['assign'];
  } catch {
    originalAssign = null;
  }
}
