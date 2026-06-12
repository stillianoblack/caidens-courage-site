import { resolvePlayerParticipantId } from './resolvePlayerParticipantId';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export type PlayerInventorySnapshot = {
  badges: string[];
  items: string[];
  stickers: string[];
  decorations: string[];
};

const EMPTY_INVENTORY: PlayerInventorySnapshot = {
  badges: [],
  items: [],
  stickers: [],
  decorations: [],
};

export async function getPlayerInventory(
  explicitParticipantId?: string,
): Promise<PlayerInventorySnapshot> {
  if (!isSupabaseConfigured() || !supabase) {
    return EMPTY_INVENTORY;
  }

  const participantId = resolvePlayerParticipantId(explicitParticipantId);
  if (!participantId) {
    return EMPTY_INVENTORY;
  }

  try {
    const [badgesResult, progressResult] = await Promise.all([
      supabase
        .from('player_badges')
        .select('badge_name')
        .eq('participant_id', participantId),
      supabase
        .from('player_progress')
        .select('reward_item, badge_unlocked')
        .eq('participant_id', participantId),
    ]);

    if (badgesResult.error) throw badgesResult.error;
    if (progressResult.error) throw progressResult.error;

    const badgeSet = new Set<string>();
    for (const row of badgesResult.data ?? []) {
      if (typeof row.badge_name === 'string' && row.badge_name.trim()) {
        badgeSet.add(row.badge_name.trim());
      }
    }
    for (const row of progressResult.data ?? []) {
      if (typeof row.badge_unlocked === 'string' && row.badge_unlocked.trim()) {
        badgeSet.add(row.badge_unlocked.trim());
      }
    }

    const items = (progressResult.data ?? [])
      .map((row) => row.reward_item)
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

    const stickers = items.filter((item) => /sticker|spark/i.test(item));
    const decorations = items.filter((item) => /decoration|torch/i.test(item));
    const ownedItems = items.filter(
      (item) => !stickers.includes(item) && !decorations.includes(item),
    );

    return {
      badges: Array.from(badgeSet),
      items: ownedItems,
      stickers,
      decorations,
    };
  } catch (err) {
    console.warn('[INVENTORY] Failed to load player inventory', err);
    return EMPTY_INVENTORY;
  }
}
