/** Deterministic presets for Focus Flame Lab embers (18–28 particles, no Math.random). */
const COUNT = 22;

export const FFL_EMBER_PRESETS = Array.from({ length: COUNT }, (_, i) => ({
  x: 4 + ((i * 19 + 7) % 90),
  delayS: ((i * 0.61) % 8.2) + i * 0.22,
  durS: 11 + (i % 8),
  driftPx: -14 + (i % 9) * 3.5,
  sizePx: 2 + (i % 4),
  opacity: 0.16 + (i % 6) * 0.028,
  /** Soft gold / warm orange emphasis */
  warm: i % 4 !== 0,
}));
