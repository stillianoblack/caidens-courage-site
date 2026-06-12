import type { CourageMissionRewardPayload } from '../types/courageMissionProgress';
import { captureAchievementPng, downloadAchievementPng } from './captureAchievementScreenshot';
import { isValidSupabaseParticipantId } from './pilotTrackingService';
import { resolvePlayerParticipantId } from './resolvePlayerParticipantId';
import { saveCampAchievementScreenshot } from './saveCampAchievementScreenshot';

export type ShareCampAchievementInput = {
  element: HTMLElement;
  payload: CourageMissionRewardPayload;
  coinsEarned?: number;
  date?: Date;
};

export type ShareCampAchievementResult = {
  message: string;
  uploadedToGallery: boolean;
};

export async function shareCampAchievement({
  element,
  payload,
  coinsEarned,
  date = new Date(),
}: ShareCampAchievementInput): Promise<ShareCampAchievementResult> {
  const { dataUrl, blob } = await captureAchievementPng({ element });
  downloadAchievementPng(dataUrl, payload.mission_id, date);

  const participantId = resolvePlayerParticipantId();
  if (!participantId || !isValidSupabaseParticipantId(participantId)) {
    return {
      message: 'Achievement saved to this device.',
      uploadedToGallery: false,
    };
  }

  const uploadResult = await saveCampAchievementScreenshot({
    blob,
    participantId,
    weekId: payload.week_id,
    missionId: payload.mission_id,
    characterId: payload.character_id,
    missionTitle: payload.mission_title,
    badgeUnlocked: payload.badge_unlocked,
    coinsEarned: coinsEarned ?? payload.coins_earned,
  });

  if (uploadResult.ok) {
    return {
      message: 'Achievement saved to Camp Gallery!',
      uploadedToGallery: true,
    };
  }

  return {
    message: 'Saved to device. Camp Gallery upload failed.',
    uploadedToGallery: false,
  };
}
