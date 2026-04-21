/**
 * Dev-only perf helper.
 *
 * This project conditionally `require()`s this module in `src/index.js`.
 * In some branches/builds the full implementation isn't present; keep a tiny
 * no-op shim so local dev builds don't warn/fail on missing module.
 */
export function installPerfDetective() {
  // Intentionally empty.
}

