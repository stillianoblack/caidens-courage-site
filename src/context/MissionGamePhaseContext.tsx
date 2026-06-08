import React, { createContext, useContext, useEffect, useState } from 'react';

export type MissionGamePhase = 'off' | 'landing' | 'quiz' | 'complete';

const MissionGamePhaseContext = createContext<MissionGamePhase>('off');
const MissionGamePhaseSetterContext = createContext<(phase: MissionGamePhase) => void>(() => {});

export function MissionGamePhaseProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<MissionGamePhase>('off');

  return (
    <MissionGamePhaseContext.Provider value={phase}>
      <MissionGamePhaseSetterContext.Provider value={setPhase}>
        {children}
      </MissionGamePhaseSetterContext.Provider>
    </MissionGamePhaseContext.Provider>
  );
}

export function useMissionGamePhase(): MissionGamePhase {
  return useContext(MissionGamePhaseContext);
}

/** Sets mission phase while mounted; resets to `off` on unmount. */
export function useSetMissionGamePhase(phase: MissionGamePhase): void {
  const setPhase = useContext(MissionGamePhaseSetterContext);

  useEffect(() => {
    setPhase(phase);
    return () => setPhase('off');
  }, [phase, setPhase]);
}
