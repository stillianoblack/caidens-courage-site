import type { CourageMapHotspot } from '../data/courageInTheDarkMap';

export type CourageMissionCardAnchor = {
  left: number;
  top: number;
};

const CARD_WIDTH = 400;
const CARD_HEIGHT_ESTIMATE = 420;
const CARD_MARGIN = 16;

/**
 * Place the mission card near the selected hotspot, clamped inside the map.
 */
export function computeCourageMissionCardAnchor(
  hotspot: CourageMapHotspot,
  mapWidth: number,
  mapHeight: number,
): CourageMissionCardAnchor {
  const hotspotX = (hotspot.position.x / 100) * mapWidth;
  const hotspotY = (hotspot.position.y / 100) * mapHeight;

  const preferRight = hotspot.position.x < 55;
  const preferAbove = hotspot.position.y > 58;

  let left = preferRight ? hotspotX + 28 : hotspotX - CARD_WIDTH - 28;
  let top = preferAbove ? hotspotY - CARD_HEIGHT_ESTIMATE - 12 : hotspotY + 20;

  const maxLeft = mapWidth - CARD_WIDTH - CARD_MARGIN;
  const maxTop = mapHeight - CARD_HEIGHT_ESTIMATE - CARD_MARGIN;

  left = Math.max(CARD_MARGIN, Math.min(left, maxLeft));
  top = Math.max(CARD_MARGIN + 48, Math.min(top, maxTop));

  return { left, top };
}
