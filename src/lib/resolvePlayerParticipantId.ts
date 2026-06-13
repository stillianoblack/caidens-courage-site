import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { readActiveChildNickname } from '../config/activeChildNickname';
import { readActiveChildState } from './activeChildContext';
import { isValidSupabaseParticipantId } from './pilotTrackingService';

export type PlayerParticipantContext = {
  participantId: string | null;
  activeChild: ReturnType<typeof readActiveChildState>;
  sources: {
    explicit?: string;
    localStorage: string;
    activeChild: string;
  };
};

/** Resolve active child participant for gameplay writes — never parent auth user id. */
export function resolvePlayerParticipantContext(
  explicitParticipantId?: string,
): PlayerParticipantContext {
  const explicit = explicitParticipantId?.trim() ?? '';
  const localStorageId = readActiveChildParticipantId().trim();
  const activeChild = readActiveChildState();

  const participantId = explicit || localStorageId || activeChild?.participantId?.trim() || null;

  return {
    participantId,
    activeChild,
    sources: {
      explicit: explicit || undefined,
      localStorage: localStorageId,
      activeChild: activeChild?.participantId?.trim() ?? '',
    },
  };
}

export function resolvePlayerParticipantId(explicitParticipantId?: string): string | null {
  return resolvePlayerParticipantContext(explicitParticipantId).participantId;
}

export function logPlayerParticipantContext(
  context: PlayerParticipantContext,
  label = '[MISSION_COMPLETE]',
): void {
  console.info(`${label} participant context`, {
    participant_id: context.participantId,
    is_valid_supabase_uuid: isValidSupabaseParticipantId(context.participantId),
    active_child: context.activeChild,
    active_child_nickname: readActiveChildNickname() ?? null,
    sources: context.sources,
  });
}
