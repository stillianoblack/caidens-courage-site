import {
  allCharacterDiscoveryDefinitions,
  discoveryRewardKey,
  parseDiscoveryIdFromRewardKey,
  resolveCharacterDiscoveryById,
  resolveCharacterDiscoveryForMission,
  type CharacterDiscoveryDefinition,
} from '../data/characterDiscoveryDefinitions';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type EarnedCharacterDiscovery = {
  id: string;
  definition: CharacterDiscoveryDefinition;
  earnedAt: string | null;
};

export type CharacterDiscoveryCatalogEntry = {
  definition: CharacterDiscoveryDefinition;
  earned: boolean;
  earnedAt: string | null;
};

async function fetchDiscoveryClaimRows(
  participantId: string,
): Promise<Array<{ reward_key: string; claimed_at: string | null }>> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('player_reward_claims')
    .select('reward_key, claimed_at')
    .eq('participant_id', participantId);

  if (error) throw error;

  return (data ?? [])
    .map((row) => ({
      reward_key: (row as { reward_key?: string | null }).reward_key?.trim() ?? '',
      claimed_at: (row as { claimed_at?: string | null }).claimed_at ?? null,
    }))
    .filter((row) => row.reward_key.startsWith('discovery:'));
}

export async function getEarnedCharacterDiscoveries(
  childId: string,
): Promise<EarnedCharacterDiscovery[]> {
  const participantId = childId.trim();
  if (!participantId) return [];

  try {
    const rows = await fetchDiscoveryClaimRows(participantId);
    const earned: EarnedCharacterDiscovery[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      if (!row.claimed_at) continue;
      const discoveryId = parseDiscoveryIdFromRewardKey(row.reward_key);
      if (!discoveryId || seen.has(discoveryId)) continue;
      const definition = resolveCharacterDiscoveryById(discoveryId);
      if (!definition) continue;
      seen.add(discoveryId);
      earned.push({
        id: discoveryId,
        definition,
        earnedAt: row.claimed_at,
      });
    }

    return earned.sort((left, right) => left.definition.name.localeCompare(right.definition.name));
  } catch (err) {
    console.warn('[DISCOVERY] Failed to load earned discoveries', err);
    return [];
  }
}

export function buildCharacterDiscoveryCatalog(
  earnedDiscoveries: readonly EarnedCharacterDiscovery[],
): CharacterDiscoveryCatalogEntry[] {
  const earnedById = new Map(earnedDiscoveries.map((entry) => [entry.id, entry]));

  return allCharacterDiscoveryDefinitions().map((definition) => {
    const earned = earnedById.get(definition.id);
    return {
      definition,
      earned: Boolean(earned),
      earnedAt: earned?.earnedAt ?? null,
    };
  });
}

export async function awardCharacterDiscovery(
  participantId: string,
  missionId: string,
): Promise<CharacterDiscoveryDefinition | null> {
  const discovery = resolveCharacterDiscoveryForMission(missionId);
  if (!discovery || !isSupabaseConfigured() || !supabase) return discovery;

  const rewardKey = discoveryRewardKey(discovery.id);
  const { error } = await supabase.from('player_reward_claims').upsert(
    {
      participant_id: participantId,
      reward_key: rewardKey,
      reward_name: discovery.name,
      claimed_at: new Date().toISOString(),
    },
    { onConflict: 'participant_id,reward_key', ignoreDuplicates: true },
  );

  if (error && error.code !== '23505') {
    console.warn('[DISCOVERY] Failed to award discovery', error);
  }

  return discovery;
}

export { resolveCharacterDiscoveryForMission, resolveCharacterDiscoveryById };
