import { useCallback } from 'react';
import { useToast } from '../portal-design-system/ToastProvider';

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function useCopyToast() {
  const { showToast } = useToast();

  const copyWithToast = useCallback(
    async (value: string, message = 'Copied.') => {
      const copied = await copyText(value);
      if (!copied) return;
      showToast(message, 'success');
    },
    [showToast],
  );

  return { copyWithToast, toast: null };
}
