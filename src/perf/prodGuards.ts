export function isProd(): boolean {
  try {
    if (typeof (globalThis as any).import_meta !== 'undefined' && (globalThis as any).import_meta?.env) {
      return !!((globalThis as any).import_meta as any).env?.PROD;
    }
  } catch {}
  return typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';
}

export function hasQueryFlag(name: string): boolean {
  try {
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get(name) === '1';
  } catch {
    return false;
  }
}

/**
 * In production, ALL perf/debug tooling should be OFF by default.
 * Turn on explicitly with: ?debugPerf=1
 */
export function allowPerfTools(): boolean {
  return !isProd() || hasQueryFlag('debugPerf');
}
