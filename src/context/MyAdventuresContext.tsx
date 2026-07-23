import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';

const ACKNOWLEDGEMENT_PREFIX = 'kid-play:my-adventures-seen:';

type MyAdventuresContextValue = {
  open: boolean;
  acknowledged: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
};

const MyAdventuresContext = createContext<MyAdventuresContextValue | null>(null);

function readAcknowledged(participantId: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(`${ACKNOWLEDGEMENT_PREFIX}${participantId}`) === 'true';
  } catch {
    return false;
  }
}

export function MyAdventuresProvider({
  participantId,
  children,
}: {
  participantId: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(() => readAcknowledged(participantId));
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openDrawer = useCallback(() => {
    setOpen(true);
    setAcknowledged(true);
    try {
      window.localStorage.setItem(`${ACKNOWLEDGEMENT_PREFIX}${participantId}`, 'true');
    } catch {
      // The drawer remains fully usable when storage is unavailable.
    }
  }, [participantId]);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const value = useMemo(
    () => ({ open, acknowledged, openDrawer, closeDrawer, triggerRef }),
    [acknowledged, closeDrawer, open, openDrawer],
  );

  return <MyAdventuresContext.Provider value={value}>{children}</MyAdventuresContext.Provider>;
}

export function useMyAdventures(): MyAdventuresContextValue {
  const context = useContext(MyAdventuresContext);
  if (!context) {
    throw new Error('useMyAdventures must be used inside MyAdventuresProvider.');
  }
  return context;
}

export const _test = { ACKNOWLEDGEMENT_PREFIX, readAcknowledged };
