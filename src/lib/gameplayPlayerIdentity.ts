import { readParentClaimContext } from '../config/parentClaimContext';
import { readActivePilotProgram } from '../config/activePilotProgram';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type GameplayPlayerIdentity = {
  participantId: string;
  displayName: string;
  playerLabel: string;
};

let cachedIdentity: GameplayPlayerIdentity | null = null;

export function setGameplayPlayerIdentity(identity: GameplayPlayerIdentity | null): void {
  cachedIdentity = identity?.participantId
    ? {
        participantId: identity.participantId.trim(),
        displayName: identity.displayName.trim() || 'Player',
        playerLabel: identity.playerLabel.trim() || identity.displayName.trim() || 'Player',
      }
    : null;

  if (process.env.NODE_ENV === 'development') {
    void logGameplayPlayerIdentityDebug();
  }
}

export function readGameplayPlayerIdentity(): GameplayPlayerIdentity | null {
  return cachedIdentity;
}

/** Child display name for gameplay UI — roster-validated only. */
export function readGameplayPlayerDisplayName(): string {
  return cachedIdentity?.displayName ?? '';
}

/** Header chip label — includes grade when available. */
export function readGameplayPlayerChipLabel(): string {
  if (!cachedIdentity?.participantId) return 'Choose Player';
  return cachedIdentity.playerLabel || cachedIdentity.displayName || 'Player';
}

export function hasGameplayPlayerIdentity(): boolean {
  return Boolean(cachedIdentity?.participantId);
}

export async function logGameplayPlayerIdentityDebug(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  const program = readActivePilotProgram();
  const parentClaim = readParentClaimContext();
  let authEmail: string | null = null;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      authEmail = data.user?.email ?? null;
    } catch {
      authEmail = null;
    }
  }

  console.info('[GAMEPLAY_PLAYER_IDENTITY]', {
    auth_user_email: authEmail,
    parent_family_name: parentClaim?.lastName ?? null,
    parent_email: parentClaim?.email ?? null,
    program_admin_first_name: program?.adminFirstName ?? null,
    active_participant_id: cachedIdentity?.participantId ?? null,
    active_participant_name: cachedIdentity?.displayName ?? null,
    displayed_player_chip: readGameplayPlayerChipLabel(),
  });
}
