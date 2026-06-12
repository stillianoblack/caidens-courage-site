const WEEKLY_THUMBNAIL_DIR = '/images/caidenscourage/Weekly Activites';

/** Week activity art for the integrated trail week header. */
export function resolveWeeklyAdventureThumbnailSrc(week: number): string | null {
  const publicUrl = process.env.PUBLIC_URL || '';
  const fileName = `week_${week}_thumbnail.svg`;
  const path = `${WEEKLY_THUMBNAIL_DIR}/${fileName}`;

  // Only week 1 art ships today; add paths here as new weekly thumbnails land.
  if (week !== 1) {
    return null;
  }

  return encodeURI(`${publicUrl}${path}`);
}
