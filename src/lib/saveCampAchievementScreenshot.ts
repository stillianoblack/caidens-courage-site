import { isSupabaseConfigured, supabase } from './supabaseClient';

export const CAMP_ACHIEVEMENTS_BUCKET = 'camp-achievements';

export type CampAchievementScreenshotMetadata = {
  participant_id: string;
  week_id: string;
  mission_id: string;
  character_id: string;
  mission_title: string;
  badge_unlocked: string;
  coins_earned: number;
  storage_path: string;
};

export type SaveCampAchievementScreenshotInput = {
  blob: Blob;
  participantId: string;
  weekId: string;
  missionId: string;
  characterId: string;
  missionTitle: string;
  badgeUnlocked: string;
  coinsEarned: number;
  timestamp?: number;
};

export type SaveCampAchievementScreenshotResult =
  | { ok: true; storagePath: string }
  | { ok: false; error: string; stage: 'upload' | 'insert' | 'config' };

export function buildCampAchievementStoragePath(
  participantId: string,
  weekId: string,
  missionId: string,
  timestamp = Date.now(),
): string {
  return `participant-achievements/${participantId}/${weekId}/${missionId}-${timestamp}.png`;
}

function blobToUploadFile(blob: Blob, missionId: string, timestamp: number): File {
  return new File([blob], `${missionId}-${timestamp}.png`, {
    type: blob.type || 'image/png',
  });
}

export async function saveCampAchievementScreenshot(
  input: SaveCampAchievementScreenshotInput,
): Promise<SaveCampAchievementScreenshotResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Supabase is not configured.', stage: 'config' };
  }

  const timestamp = input.timestamp ?? Date.now();
  const storagePath = buildCampAchievementStoragePath(
    input.participantId,
    input.weekId,
    input.missionId,
    timestamp,
  );
  const file = blobToUploadFile(input.blob, input.missionId, timestamp);

  try {
    const { error: uploadError } = await supabase.storage
      .from(CAMP_ACHIEVEMENTS_BUCKET)
      .upload(storagePath, file, {
        upsert: false,
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[CAMP_ACHIEVEMENT] storage upload failed:', uploadError);
      }
      return { ok: false, error: uploadError.message, stage: 'upload' };
    }

    const metadata: CampAchievementScreenshotMetadata = {
      participant_id: input.participantId,
      week_id: input.weekId,
      mission_id: input.missionId,
      character_id: input.characterId,
      mission_title: input.missionTitle,
      badge_unlocked: input.badgeUnlocked,
      coins_earned: input.coinsEarned,
      storage_path: storagePath,
    };

    const { error: insertError } = await supabase
      .from('camp_achievement_screenshots')
      .insert(metadata);

    if (insertError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[CAMP_ACHIEVEMENT] metadata insert failed:', insertError);
      }
      return { ok: false, error: insertError.message, stage: 'insert' };
    }

    return { ok: true, storagePath };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Camp achievement upload failed.';
    if (process.env.NODE_ENV === 'development') {
      console.error('[CAMP_ACHIEVEMENT] upload error:', err);
    }
    return { ok: false, error: message, stage: 'upload' };
  }
}
