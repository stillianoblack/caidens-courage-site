import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { KidPlaySessionRow } from '../lib/kidPlaySessionTypes';
import { updateKidPlaySessionActivity } from '../lib/kidPlaySessionService';

export type KidPlaySessionContextValue = {
  sessionId: string;
  session: KidPlaySessionRow;
  isKidPlayShell: true;
  touchResume: (patch: Record<string, unknown>) => void;
};

const KidPlaySessionContext = createContext<KidPlaySessionContextValue | null>(null);

export function KidPlaySessionProvider({
  session,
  children,
}: {
  session: KidPlaySessionRow;
  children: ReactNode;
}) {
  const touchResume = useCallback(
    (patch: Record<string, unknown>) => {
      void updateKidPlaySessionActivity(session.id, {
        ...(session.resume_payload ?? {}),
        ...patch,
        sessionId: session.id,
        updatedAt: new Date().toISOString(),
      });
    },
    [session.id, session.resume_payload],
  );

  const value = useMemo<KidPlaySessionContextValue>(
    () => ({
      sessionId: session.id,
      session,
      isKidPlayShell: true,
      touchResume,
    }),
    [session, touchResume],
  );

  return (
    <KidPlaySessionContext.Provider value={value}>{children}</KidPlaySessionContext.Provider>
  );
}

export function useKidPlaySession(): KidPlaySessionContextValue | null {
  return useContext(KidPlaySessionContext);
}

export function useKidPlaySessionRequired(): KidPlaySessionContextValue {
  const ctx = useContext(KidPlaySessionContext);
  if (!ctx) {
    throw new Error('useKidPlaySessionRequired must be used within KidPlaySessionProvider');
  }
  return ctx;
}
