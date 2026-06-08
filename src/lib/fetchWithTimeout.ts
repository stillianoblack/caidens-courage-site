/** Max wait for non-critical dashboard Supabase reads (gallery, progress, tracking). */
export const DASHBOARD_FETCH_TIMEOUT_MS = 5000;

export class FetchTimeoutError extends Error {
  constructor(label: string) {
    super(`${label}_timeout`);
    this.name = 'FetchTimeoutError';
  }
}

export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number = DASHBOARD_FETCH_TIMEOUT_MS,
  label = 'fetch',
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new FetchTimeoutError(label)), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
