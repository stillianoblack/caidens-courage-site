/** Tap video index before the child steadies the flame (The Path). */
export const TAP_VIDEO_BEFORE_STEADY_INDEX = 0;

/** Tap video index after the child steadies the flame (The Path). */
export const TAP_VIDEO_AFTER_STEADY_INDEX = 3;

/** Shared completed flame clip for all adventures after steady (MVP). */
export function sharedSteadyCompleteVideoCandidates(publicUrl: string): string[] {
  const base = `${publicUrl}/videos/focus-flame/tap/`;
  return [`${base}the-path-tap-3.mp4`, `${base}path-tap-3.mp4`];
}

/** Alternate filenames on disk when canonical tap names are missing. */
const PATH_TAP_ALT_FILES: Record<number, readonly string[]> = {
  1: ['path_tap_1.mp4'],
  2: ['path-tap-2.mp4'],
  3: ['path-tap-3.mp4'],
};

/** Candidate URLs to try when loading a tap progression clip. */
export function resolveTapVideoCandidates(
  publicUrl: string,
  tapVideoSequence: readonly string[] | null | undefined,
  tapIndex: number,
  fallbackSceneVideoSrc?: string
): string[] {
  if (!tapVideoSequence?.length) {
    return fallbackSceneVideoSrc ? [fallbackSceneVideoSrc] : [];
  }
  if (tapIndex < 0 || tapIndex >= tapVideoSequence.length) {
    return fallbackSceneVideoSrc ? [fallbackSceneVideoSrc] : [];
  }

  const candidates: string[] = [];
  const primary = tapVideoSequence[tapIndex];
  if (primary) candidates.push(primary);

  const base = `${publicUrl}/videos/focus-flame/tap/`;
  const alts = PATH_TAP_ALT_FILES[tapIndex];
  if (alts) {
    for (const file of alts) {
      const url = `${base}${file}`;
      if (!candidates.includes(url)) candidates.push(url);
    }
  }

  if (tapIndex === 0 && fallbackSceneVideoSrc && !candidates.includes(fallbackSceneVideoSrc)) {
    candidates.push(fallbackSceneVideoSrc);
  }

  return candidates;
}
