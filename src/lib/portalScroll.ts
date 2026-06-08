/** Reset viewport and portal content scroll on route changes. */
export function resetPortalScroll(): void {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  document.querySelector('.family-content')?.scrollTo(0, 0);
  document.querySelector('.pilot-content')?.scrollTo(0, 0);
  document.querySelector('.portal-contentFrame')?.scrollTo(0, 0);
}
