/**
 * Kill-switch feature flags. If URL has ?safe=1, all are false.
 */

function readSafeFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('safe') === '1';
  } catch {
    return false;
  }
}

const safe = readSafeFromUrl();

export const FLAGS = {
  CHATBOT: !safe,
  ANIMATIONS: !safe,
  HERO_MEDIA: !safe,
};
