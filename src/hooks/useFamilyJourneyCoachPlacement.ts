import { useEffect, useState } from 'react';

export type FamilyJourneyCoachPlacement = 'rail' | 'inline';

function resolveFamilyJourneyCoachPlacement(): FamilyJourneyCoachPlacement {
  if (typeof window === 'undefined') return 'rail';
  return window.matchMedia('(min-width: 1101px)').matches ? 'rail' : 'inline';
}

/** Desktop: utility rail. Tablet/mobile: stack below dashboard content. */
export function useFamilyJourneyCoachPlacement(): FamilyJourneyCoachPlacement {
  const [placement, setPlacement] = useState<FamilyJourneyCoachPlacement>(resolveFamilyJourneyCoachPlacement);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1101px)');
    const update = () => setPlacement(resolveFamilyJourneyCoachPlacement());
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return placement;
}
