import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ActivePilotProgram } from '../types/pilotProgram';
import { readActivePilotProgram } from '../config/activePilotProgram';
import {
  readActiveAccessCode,
  readActiveFamilyContext,
  readActivePortalRole,
  type ActiveFamilyContext,
  type PortalRole,
} from '../config/portalContext';
import { readFamilyPortalSession } from '../config/familyPortalAccess';
import { readParentClaimContext, type ParentClaimContext } from '../config/parentClaimContext';
import {
  ACTIVE_CHILD_EVENT,
  MODULE_COMPLETE_EVENT,
  readActiveChildState,
  type ActiveChildState,
} from '../lib/activeChildContext';
import { CHILD_PROFILE_UPDATED_EVENT } from '../config/activeChildParticipant';
import { readStudentPinSession, type StudentPinSession } from '../lib/studentPinSession';
import { readLocalKidPlaySessionId } from '../lib/kidPlaySessionService';
import {
  hasKidPlayReturnSessionContext,
  shouldHideReturnSessionAccessCode,
} from '../lib/kidPlayReturnUnlock';
import { isKidPlayFamilySoftLocked } from '../lib/kidPlayFamilySoftLock';
import { PORTAL_SESSION_CHANGED_EVENT } from '../lib/portalSessionEvents';

export type PortalSessionSnapshot = {
  activeProgram: ActivePilotProgram | null;
  programCode: string;
  activeAccessCode: string | null;
  activeRole: PortalRole | null;
  activeFamily: ActiveFamilyContext | null;
  familySessionActive: boolean;
  parentClaim: ParentClaimContext | null;
  activeParticipant: ActiveChildState | null;
  activeParticipantId: string;
  studentPinSession: StudentPinSession | null;
  kidPlaySessionId: string | null;
  hasReturnSessionContext: boolean;
  hideReturnAccessCode: boolean;
  familySoftLocked: boolean;
};

export type PortalSessionContextValue = PortalSessionSnapshot & {
  refreshSession: () => PortalSessionSnapshot;
};

const PortalSessionContext = createContext<PortalSessionContextValue | null>(null);

export function readPortalSessionSnapshot(): PortalSessionSnapshot {
  const activeProgram = readActivePilotProgram();
  const activeFamily = readActiveFamilyContext();
  const parentClaim = readParentClaimContext();
  const activeParticipant = readActiveChildState();
  const studentPinSession = readStudentPinSession({ allowCampUnderFamilyPortal: true });

  return {
    activeProgram,
    programCode:
      activeProgram?.programCode?.trim() ||
      activeFamily?.programCode?.trim() ||
      parentClaim?.programCode?.trim() ||
      studentPinSession?.programCode?.trim() ||
      '',
    activeAccessCode: readActiveAccessCode(),
    activeRole: readActivePortalRole(),
    activeFamily,
    familySessionActive: readFamilyPortalSession(),
    parentClaim,
    activeParticipant,
    activeParticipantId: activeParticipant?.participantId?.trim() || '',
    studentPinSession,
    kidPlaySessionId: readLocalKidPlaySessionId(),
    hasReturnSessionContext: hasKidPlayReturnSessionContext(),
    hideReturnAccessCode: shouldHideReturnSessionAccessCode(),
    familySoftLocked: isKidPlayFamilySoftLocked(),
  };
}

export function PortalSessionProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<PortalSessionSnapshot>(() => readPortalSessionSnapshot());

  const refreshSession = useCallback(() => {
    const next = readPortalSessionSnapshot();
    setSnapshot(next);
    return next;
  }, []);

  useEffect(() => {
    const handleSessionChange = () => {
      refreshSession();
    };

    window.addEventListener(PORTAL_SESSION_CHANGED_EVENT, handleSessionChange);
    window.addEventListener(ACTIVE_CHILD_EVENT, handleSessionChange);
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleSessionChange);
    window.addEventListener(MODULE_COMPLETE_EVENT, handleSessionChange);
    window.addEventListener('storage', handleSessionChange);
    window.addEventListener('focus', handleSessionChange);
    document.addEventListener('visibilitychange', handleSessionChange);

    return () => {
      window.removeEventListener(PORTAL_SESSION_CHANGED_EVENT, handleSessionChange);
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleSessionChange);
      window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleSessionChange);
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleSessionChange);
      window.removeEventListener('storage', handleSessionChange);
      window.removeEventListener('focus', handleSessionChange);
      document.removeEventListener('visibilitychange', handleSessionChange);
    };
  }, [refreshSession]);

  const value = useMemo<PortalSessionContextValue>(
    () => ({
      ...snapshot,
      refreshSession,
    }),
    [refreshSession, snapshot],
  );

  return (
    <PortalSessionContext.Provider value={value}>
      {children}
    </PortalSessionContext.Provider>
  );
}

export function usePortalSession(): PortalSessionContextValue {
  const context = useContext(PortalSessionContext);
  if (!context) {
    throw new Error('usePortalSession must be used within PortalSessionProvider');
  }
  return context;
}

export function useOptionalPortalSession(): PortalSessionContextValue | null {
  return useContext(PortalSessionContext);
}
