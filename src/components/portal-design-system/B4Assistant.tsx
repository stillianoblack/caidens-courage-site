import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ENABLE_B4_CHAT } from '../../config/featureFlags';
import DeferredB4ChatWidget from '../DeferredB4ChatWidget';

const B4_ASSISTANT_INSTANCE_KEY = '__caidensB4AssistantInstance';

/**
 * Shared floating Ask B-4 assistant for Facilitator, Family, and Kid portal shells.
 * Portals to document.body so fixed positioning is never clipped by portal overflow.
 */
export default function B4Assistant() {
  const [mounted, setMounted] = useState(false);
  const instanceIdRef = useRef(`b4-${Math.random().toString(36).slice(2)}`);
  const isPrimaryRef = useRef(false);

  useEffect(() => {
    const root = window as Window & { [B4_ASSISTANT_INSTANCE_KEY]?: string };
    const instanceId = instanceIdRef.current;
    if (root[B4_ASSISTANT_INSTANCE_KEY] && root[B4_ASSISTANT_INSTANCE_KEY] !== instanceId) {
      return;
    }
    root[B4_ASSISTANT_INSTANCE_KEY] = instanceId;
    isPrimaryRef.current = true;
    setMounted(true);

    return () => {
      if (root[B4_ASSISTANT_INSTANCE_KEY] === instanceId) {
        delete root[B4_ASSISTANT_INSTANCE_KEY];
      }
    };
  }, []);

  if (!ENABLE_B4_CHAT || !mounted || !isPrimaryRef.current) return null;

  return createPortal(<DeferredB4ChatWidget />, document.body);
}
