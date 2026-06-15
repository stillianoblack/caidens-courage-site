import {
  normalizeOwnedBadges,
  type NormalizedOwnedBadge,
  type RawOwnedBadgeRow,
} from './cmsBadgeArtwork';
import { resolvePlayerParticipantId } from './resolvePlayerParticipantId';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export type OwnedBadge = NormalizedOwnedBadge;

export type PlayerInventorySnapshot = {
  badges: OwnedBadge[];
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
        .select('badge_name, week_id, mission_id')
        .eq('participant_id', participantId),
      supabase
        .from('player_progress')
        .select('reward_item, badge_unlocked, week_id, mission_id')
        .eq('participant_id', participantId),
    ]);

    if (badgesResult.error) throw badgesResult.error;
    if (progressResult.error) throw progressResult.error;

    type BadgeRow = {
      badge_name?: string | null;
      week_id?: string | null;
      mission_id?: string | null;
    };
    type ProgressRow = {
      reward_item?: string | null;
      badge_unlocked?: string | null;
      week_id?: string | null;
      mission_id?: string | null;
    };

    const rawBadges: RawOwnedBadgeRow[] = [];

    for (const row of (badgesResult.data ?? []) as BadgeRow[]) {
      if (typeof row.badge_name !== 'string' || !row.badge_name.trim()) continue;
      rawBadges.push({
        name: row.badge_name.trim(),
        weekId: typeof row.week_id === 'string' ? row.week_id : null,
        missionId: typeof row.mission_id === 'string' ? row.mission_id : null,
      });
    }

    for (const row of (progressResult.data ?? []) as ProgressRow[]) {
      if (typeof row.badge_unlocked !== 'string' || !row.badge_unlocked.trim()) continue;
      rawBadges.push({
        name: row.badge_unlocked.trim(),
        weekId: typeof row.week_id === 'string' ? row.week_id : null,
        missionId: typeof row.mission_id === 'string' ? row.mission_id : null,
      });
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
      badges: normalizeOwnedBadges(rawBadges),
      items: ownedItems,
      stickers,
      decorations,
    };
  } catch (err) {
    console.warn('[INVENTORY] Failed to load player inventory', err);
    return EMPTY_INVENTORY;
  }
}
