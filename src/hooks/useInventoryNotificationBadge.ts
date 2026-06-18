import { useCallback, useEffect, useState } from 'react';
import { ACTIVE_CHILD_EVENT, MODULE_COMPLETE_EVENT } from '../lib/activeChildContext';
import { CHILD_PROFILE_UPDATED_EVENT, readActiveChildParticipantId } from '../config/activeChildParticipant';
import {
  INVENTORY_VIEWED_EVENT,
  readInventoryNewRewardCount,
} from '../lib/inventoryNotificationService';

export function useInventoryNotificationBadge(participantId?: string | null): number {
  const [count, setCount] = useState(() => readInventoryNewRewardCount(participantId));

  const refresh = useCallback(() => {
    setCount(readInventoryNewRewardCount(participantId));
  }, [participantId]);

  useEffect(() => {
    refresh();
    const handleRefresh = () => refresh();
    window.addEventListener(INVENTORY_VIEWED_EVENT, handleRefresh);
    window.addEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
    window.addEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
    window.addEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(INVENTORY_VIEWED_EVENT, handleRefresh);
      window.removeEventListener(MODULE_COMPLETE_EVENT, handleRefresh);
      window.removeEventListener(ACTIVE_CHILD_EVENT, handleRefresh);
      window.removeEventListener(CHILD_PROFILE_UPDATED_EVENT, handleRefresh);
    };
  }, [refresh]);

  useEffect(() => {
    if (!participantId) {
      setCount(readInventoryNewRewardCount(readActiveChildParticipantId()));
      return;
    }
    refresh();
  }, [participantId, refresh]);

  return count;
}
