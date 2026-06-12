import { useEffect, useState } from 'react';

export type CoachViewportPlacement = 'rail' | 'afterMetrics' | 'footer';

function resolveCoachViewportPlacement(): CoachViewportPlacement {
  if (typeof window === 'undefined') return 'rail';
  if (window.matchMedia('(min-width: 1101px)').matches) return 'rail';
  if (window.matchMedia('(min-width: 768px)').matches) return 'afterMetrics';
  return 'footer';
}

/** One coach surface per viewport: desktop rail, tablet below KPIs, mobile footer. */
export function useCoachViewportPlacement(): CoachViewportPlacement {
  const [placement, setPlacement] = useState<CoachViewportPlacement>(resolveCoachViewportPlacement);

  useEffect(() => {
    const tabletMq = window.matchMedia('(max-width: 1100px)');
    const mobileMq = window.matchMedia('(max-width: 767px)');

    const update = () => {
      setPlacement(resolveCoachViewportPlacement());
    };

    update();
    tabletMq.addEventListener('change', update);
    mobileMq.addEventListener('change', update);
    return () => {
      tabletMq.removeEventListener('change', update);
      mobileMq.removeEventListener('change', update);
    };
  }, []);

  return placement;
}
