import { toPng } from 'html-to-image';
import { preloadCaptureImages } from './preloadCaptureImages';

type CaptureAchievementOptions = {
  element: HTMLElement;
  missionId: string;
  date?: Date;
};

export type CapturedAchievementPng = {
  dataUrl: string;
  blob: Blob;
};

function formatAchievementDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildAchievementFilename(missionId: string, date: Date): string {
  return `courage-achievement-${missionId}-${formatAchievementDate(date)}.png`;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function downloadAchievementPng(dataUrl: string, missionId: string, date = new Date()): string {
  const filename = buildAchievementFilename(missionId, date);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
  return filename;
}

/** Capture a mission-complete card as PNG without downloading. */
export async function captureAchievementPng({
  element,
}: Pick<CaptureAchievementOptions, 'element'>): Promise<CapturedAchievementPng> {
  await preloadCaptureImages(element);

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#0b1220',
  });

  return {
    dataUrl,
    blob: dataUrlToBlob(dataUrl),
  };
}

/**
 * Capture a mission-complete card as PNG and download locally.
 * @deprecated Prefer shareCampAchievement for capture + optional gallery upload.
 */
export async function captureAchievementScreenshot({
  element,
  missionId,
  date = new Date(),
}: CaptureAchievementOptions): Promise<string> {
  const { dataUrl } = await captureAchievementPng({ element });
  return downloadAchievementPng(dataUrl, missionId, date);
}

export { buildAchievementFilename, formatAchievementDate };
