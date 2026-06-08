import React, { useCallback, useState } from 'react';

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function useCopyToast() {
  const [visible, setVisible] = useState(false);

  const copyWithToast = useCallback(async (value: string) => {
    const copied = await copyText(value);
    if (!copied) return;
    setVisible(true);
    window.setTimeout(() => setVisible(false), 2000);
  }, []);

  const toast = visible ? (
    <div className="portal-copyToast" role="status" aria-live="polite">
      Copied
    </div>
  ) : null;

  return { copyWithToast, toast };
}
