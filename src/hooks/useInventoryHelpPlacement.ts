import { useEffect, useState } from 'react';

export type InventoryHelpPlacement = 'rail' | 'sheet';

function resolveInventoryHelpPlacement(): InventoryHelpPlacement {
  if (typeof window === 'undefined') return 'rail';
  return window.matchMedia('(min-width: 1101px)').matches ? 'rail' : 'sheet';
}

/** Desktop: portal right rail. Tablet/mobile: info icon + bottom sheet. */
export function useInventoryHelpPlacement(): InventoryHelpPlacement {
  const [placement, setPlacement] = useState<InventoryHelpPlacement>(resolveInventoryHelpPlacement);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1101px)');
    const update = () => setPlacement(resolveInventoryHelpPlacement());
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return placement;
}
