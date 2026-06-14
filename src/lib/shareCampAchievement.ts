import type { CourageMissionRewardPayload } from '../types/courageMissionProgress';
import {
  captureAchievementPng,
  downloadAchievementPng,
  buildAchievementFilename,
} from './captureAchievementScreenshot';
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
  openedInNewTab?: boolean;
};

function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

async function tryNativeShare(blob: Blob, filename: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false;
  }
  try {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      return false;
    }
    await navigator.share({ files: [file], title: 'Caiden\'s Courage Achievement' });
    return true;
  } catch {
    return false;
  }
}

function openPngInNewTab(dataUrl: string): boolean {
  const opened = window.open(dataUrl, '_blank', 'noopener,noreferrer');
  return Boolean(opened);
}

export async function shareCampAchievement({
  element,
  payload,
  coinsEarned,
  date = new Date(),
}: ShareCampAchievementInput): Promise<ShareCampAchievementResult> {
  const { dataUrl, blob } = await captureAchievementPng({ element });
  const filename = buildAchievementFilename(payload.mission_id, date);

  const sharedNatively = await tryNativeShare(blob, filename);
  let openedInNewTab = false;

  if (!sharedNatively) {
    if (isIosDevice()) {
      openedInNewTab = openPngInNewTab(dataUrl);
      if (!openedInNewTab) {
        downloadAchievementPng(dataUrl, payload.mission_id, date);
      }
    } else {
      downloadAchievementPng(dataUrl, payload.mission_id, date);
    }
  }

  const participantId = resolvePlayerParticipantId();
  if (!participantId || !isValidSupabaseParticipantId(participantId)) {
    return {
      message: sharedNatively
        ? 'Achievement shared from this device.'
        : openedInNewTab
          ? 'Image opened in a new tab. Press and hold to save.'
          : 'Achievement saved to this device.',
      uploadedToGallery: false,
      openedInNewTab,
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
      message: sharedNatively
        ? 'Achievement shared and saved to Camp Gallery!'
        : openedInNewTab
          ? 'Saved to Camp Gallery! Image opened in a new tab — press and hold to save.'
          : 'Achievement saved to Camp Gallery!',
      uploadedToGallery: true,
      openedInNewTab,
    };
  }

  return {
    message: sharedNatively
      ? 'Shared from device. Camp Gallery upload failed.'
      : openedInNewTab
        ? 'Image opened in a new tab. Press and hold to save. Camp Gallery upload failed.'
        : 'Saved to device. Camp Gallery upload failed.',
    uploadedToGallery: false,
    openedInNewTab,
  };
}
