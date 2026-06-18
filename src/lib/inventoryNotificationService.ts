import { MODULE_COMPLETE_EVENT } from './activeChildContext';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';

const NEW_REWARDS_PREFIX = 'cc-inventory-new-count';
export const INVENTORY_VIEWED_EVENT = 'cc-inventory-viewed';

function storageKey(participantId: string): string {
  return `${NEW_REWARDS_PREFIX}-${participantId.trim()}`;
}

export function readInventoryNewRewardCount(participantId?: string | null): number {
  const id = participantId?.trim() || readActiveChildParticipantId();
  if (!id || typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(storageKey(id));
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function markInventoryHasNewRewards(participantId: string): void {
  if (!participantId.trim() || typeof window === 'undefined') return;
  try {
    const next = readInventoryNewRewardCount(participantId) + 1;
    window.localStorage.setItem(storageKey(participantId), String(next));
    window.dispatchEvent(new CustomEvent(INVENTORY_VIEWED_EVENT));
    window.dispatchEvent(new CustomEvent(MODULE_COMPLETE_EVENT));
  } catch {
    /* ignore */
  }
}

export function clearInventoryNewRewards(participantId: string): void {
  if (!participantId.trim() || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(storageKey(participantId));
    window.dispatchEvent(new CustomEvent(INVENTORY_VIEWED_EVENT));
  } catch {
    /* ignore */
  }
}
