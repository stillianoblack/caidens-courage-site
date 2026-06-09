import { useCallback, useEffect, useState } from 'react';
import {
  ACTIVE_CHILD_EVENT,
  readActiveChildState,
  setActiveChild,
  type ActiveChildState,
} from '../lib/activeChildContext';
import { ACTIVE_CHILD_PARTICIPANT_ID_KEY } from '../config/activeChildParticipant';
import { ACTIVE_CHILD_NICKNAME_KEY } from '../config/activeChildNickname';

export type SelectableChild = {
  participantId: string;
  displayName: string;
  firstName?: string;
};

function readState(): ActiveChildState | null {
  return readActiveChildState();
}

export function useActiveChild(selectableChildren: SelectableChild[] = []) {
  const [activeChild, setActiveChildState] = useState<ActiveChildState | null>(() => readState());

  const refresh = useCallback(() => {
    setActiveChildState(readState());
  }, []);

  useEffect(() => {
    const onActiveChild = () => refresh();
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === ACTIVE_CHILD_PARTICIPANT_ID_KEY ||
        event.key === ACTIVE_CHILD_NICKNAME_KEY
      ) {
        refresh();
      }
    };

    window.addEventListener(ACTIVE_CHILD_EVENT, onActiveChild);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ACTIVE_CHILD_EVENT, onActiveChild);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  useEffect(() => {
    if (activeChild?.participantId || selectableChildren.length !== 1) return;
    const only = selectableChildren[0];
    setActiveChild({
      participantId: only.participantId,
      displayName: only.displayName,
      firstName: only.firstName,
    });
  }, [activeChild?.participantId, selectableChildren]);

  const selectChild = useCallback((child: SelectableChild) => {
    setActiveChild({
      participantId: child.participantId,
      displayName: child.displayName,
      firstName: child.firstName,
    });
    setActiveChildState(readState());
  }, []);

  const needsChildSelection = selectableChildren.length > 1 && !activeChild?.participantId;

  return {
    activeChild,
    participantId: activeChild?.participantId ?? '',
    displayName: activeChild?.displayName ?? '',
    hasActiveChild: Boolean(activeChild?.participantId),
    needsChildSelection,
    selectChild,
    refresh,
  };
}
