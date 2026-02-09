/* Global long-task observer for development.
 *
 * Logs when the main thread is blocked by a task > 200ms.
 * Only enabled when NODE_ENV === 'development'.
 */

/* eslint-disable no-console */

export {};

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  try {
    if ('PerformanceObserver' in window && 'PerformanceLongTaskTiming' in (window as any)) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntry[]) {
          const duration = (entry as any).duration as number;
          if (duration > 200) {
            console.warn('[longTasks] LONG_TASK >200ms', {
              duration,
              name: entry.name,
              startTime: entry.startTime,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] as any });
      console.log('[longTasks] observer enabled');
    }
  } catch (error) {
    console.warn('[longTasks] failed to start', error);
  }
}

