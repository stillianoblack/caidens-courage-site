import { useEffect } from 'react';

/** Locks document body scroll while a modal is open. */
export function useModalScrollLock(open: boolean): void {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
}
