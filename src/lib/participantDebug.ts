import { readParentClaimContext } from '../config/parentClaimContext';
import { readActiveChildParticipantId } from '../config/activeChildParticipant';
import { readActiveChildNickname } from '../config/activeChildNickname';
import { readActiveChildState } from './activeChildContext';
import { readGameplayPlayerChipLabel } from './gameplayPlayerIdentity';
import { getB4CheckInStatus } from './b4CheckInStatus';
import { resolveTrackingProgramCode } from './activeProgramContext';
import { readParticipantGradeSettingsAsync } from './mirandaGradeBandResolver';
import { hasCanonicalGradeLevel } from './participantGradeDisplay';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { ActiveParticipantState } from '../types/activeParticipant';

export type ParticipantDebugSnapshot = {
  authUserId: string | null;
  activeParticipantId: string | null;
  activeParticipantName: string | null;
  activeParticipantGrade: string | null;
  baselineCompleted: boolean;
  b4CheckInStatus: string | null;
  walletParticipantId: string | null;
  walletTotalCoins: number | null;
  progressParticipantId: string | null;
  progressRowCount: number | null;
  nicknameStorage: string | null;
  storedParticipantId: string | null;
  parentFamilyName: string | null;
  parentEmail: string | null;
  displayedPlayerChip: string;
};

export async function buildParticipantDebugSnapshot(
  participant: ActiveParticipantState | null,
): Promise<ParticipantDebugSnapshot> {
  const participantId = participant?.participantId?.trim() || readActiveChildParticipantId().trim() || null;
  const programCode = resolveTrackingProgramCode() ?? undefined;

  let authUserId: string | null = null;
  let walletParticipantId: string | null = null;
  let walletTotalCoins: number | null = null;
  let progressParticipantId: string | null = null;
  let progressRowCount: number | null = null;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      authUserId = authData.user?.id ?? null;
    } catch {
      authUserId = null;
    }

    if (participantId) {
      try {
        const { data: wallet } = await supabase
          .from('player_wallets')
          .select('participant_id, total_coins')
          .eq('participant_id', participantId)
          .maybeSingle();
        walletParticipantId = wallet?.participant_id ?? null;
        walletTotalCoins = wallet?.total_coins ?? null;
      } catch {
        /* ignore */
      }

      try {
        const { data: progressRows, count } = await supabase
          .from('player_mission_progress')
          .select('participant_id', { count: 'exact', head: false })
          .eq('participant_id', participantId)
          .limit(1);
        progressParticipantId = progressRows?.[0]?.participant_id ?? participantId;
        progressRowCount = count ?? progressRows?.length ?? 0;
      } catch {
        /* ignore */
      }
    }
  }

  const gradeSettings = participantId
    ? await readParticipantGradeSettingsAsync(participantId)
    : { gradeLevel: null, gradeBand: null, allowStretch: false };
  const b4Status = participantId
    ? await getB4CheckInStatus({ programCode, participantId })
    : null;
  const baselineCompleted = b4Status?.baselineComplete ?? false;

  const state = readActiveChildState();

  return {
    authUserId,
    activeParticipantId: participantId,
    activeParticipantName: participant?.displayName ?? state?.displayName ?? null,
    activeParticipantGrade: hasCanonicalGradeLevel(gradeSettings.gradeLevel)
      ? gradeSettings.gradeLevel
      : gradeSettings.gradeBand ?? null,
    baselineCompleted,
    b4CheckInStatus: b4Status?.status ?? null,
    walletParticipantId,
    walletTotalCoins,
    progressParticipantId,
    progressRowCount,
    nicknameStorage: readActiveChildNickname() || null,
    storedParticipantId: readActiveChildParticipantId() || null,
    parentFamilyName: readParentClaimContext()?.lastName ?? null,
    parentEmail: readParentClaimContext()?.email ?? null,
    displayedPlayerChip: readGameplayPlayerChipLabel(),
  };
}

export function logParticipantDebugSnapshot(snapshot: ParticipantDebugSnapshot): void {
  console.info('[PARTICIPANT_DEBUG]', snapshot);
}
