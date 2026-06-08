/** True for in-app routes and same-page hash links (not external URLs or mailto). */
export function isInternalAppHref(href: string): boolean {
  if (!href) return false;
  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return false;
  }
  return href.startsWith('/') || href.startsWith('#');
}
