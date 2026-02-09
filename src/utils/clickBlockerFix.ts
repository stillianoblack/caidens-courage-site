/**
 * Production-safe click-blocker detector (temporary).
 * Only runs when ?debugClicks=1 (always) or localStorage.debugClicks === '1' (dev only).
 * In production, localStorage is ignored so we never enable from storage.
 */

import { isProd } from '../perf/prodGuards';

const BLOCKER_CLASS_PATTERN = /backdrop|overlay|transition|loader|modal|curtain|screenblocker/i;

function isInteractive(el: Element): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute?.('role') ?? '';
  const isButton = tag === 'button' || tag === 'a' || role === 'button' || role === 'link';
  const isInput = tag === 'input' || tag === 'select' || tag === 'textarea';
  const isNav = el.closest?.('nav') !== null && (el.tagName === 'A' || el.querySelector?.('a'));
  if (isButton || isInput || isNav) return true;
  if (el.getAttribute?.('tabindex') !== null && el.getAttribute('tabindex') !== '-1') return true;
  return false;
}

function coversMostViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
  if (vw === 0 || vh === 0) return false;
  const area = rect.width * rect.height;
  const viewportArea = vw * vh;
  return area >= viewportArea * 0.5;
}

function shouldDisableOverlay(el: Element): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(el);
  const pointerEvents = style.pointerEvents;
  const opacity = style.opacity;
  const visibility = style.visibility;

  if (pointerEvents === 'none') return false;

  const isInvisible = opacity === '0' || visibility === 'hidden';
  const hasBlockerClass = BLOCKER_CLASS_PATTERN.test(el.className || '');
  if (!isInvisible && !hasBlockerClass) return false;

  return true;
}

function tryDisableOverlay(e: { clientX: number; clientY: number }): void {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el) return;
  if (isInteractive(el)) return;
  if (!coversMostViewport(el)) return;
  if (!shouldDisableOverlay(el)) return;

  const htmlEl = el as HTMLElement;
  htmlEl.style.pointerEvents = 'none';
  htmlEl.style.display = 'none';
  console.warn('[ClickBlockerFix] disabled overlay:', el);
}

function handleClick(e: MouseEvent): void {
  tryDisableOverlay(e);
}

function handlePointerDown(e: PointerEvent): void {
  tryDisableOverlay(e);
}

export function installClickBlockerFix(): void {
  
  if (typeof document === "undefined") return;
  if (process.env.NODE_ENV === "production") return;
if (typeof document === "undefined") return;
  if (process.env.NODE_ENV === "production") return;
  if (typeof document === 'undefined') return;

  const fromQuery =
    typeof window !== 'undefined' && window.location && window.location.search.includes('debugClicks=1');
  const fromStorage =
    !isProd() && typeof localStorage !== 'undefined' && localStorage.getItem('debugClicks') === '1';
  const enabled = fromQuery || fromStorage;

  if (!enabled) return;

  document.addEventListener('click', handleClick, true);
  document.addEventListener('pointerdown', handlePointerDown, true);
  console.warn('[ClickBlockerFix] installed (debug). Use ?debugClicks=1 or in dev localStorage.debugClicks=1');
}
