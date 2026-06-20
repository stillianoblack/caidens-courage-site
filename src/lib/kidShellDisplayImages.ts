import { isUnusableCharacterImageUrl } from '../design-system/kids-adventure/characterThemes';

const GENERIC_PLACEHOLDER_MARKERS = [
  'focus-flame-mark',
  'focus-flame.svg',
  'focus-flame-badge',
  'generic-badge',
  'generic_placeholder',
];

/** True when a URL is safe to show in kid-shell pills/cards (not empty, not generic flame). */
export function isKidShellDisplayImageUrl(url?: string | null): url is string {
  const trimmed = url?.trim();
  if (!trimmed || isUnusableCharacterImageUrl(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  return !GENERIC_PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

export function resolveHudThumbBackgroundStyle(
  url?: string | null,
): { backgroundImage: string } | undefined {
  if (!isKidShellDisplayImageUrl(url)) return undefined;
  return { backgroundImage: `url("${url}")` };
}
