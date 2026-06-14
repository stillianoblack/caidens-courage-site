import { ADMIN_PORTAL_PATH } from '../config/adminAccess';
import { FAMILY_HUB_PATH } from '../config/courageRoutes';
import {
  ADMIN_PREVIEW_PARAM,
  PREVIEW_ADVENTURE_PARAM,
  PREVIEW_MODE_LIVE,
} from './adventureVisibility';

/** Admin bypass — draft/scheduled visible, unlock date ignored. */
export function buildAdminAdventurePreviewUrl(adventureId: string): string {
  const params = new URLSearchParams();
  params.set(PREVIEW_ADVENTURE_PARAM, adventureId);
  params.set(ADMIN_PREVIEW_PARAM, 'true');
  return `${FAMILY_HUB_PATH}/weekly-adventures?${params.toString()}`;
}

/** Family visibility rules — what families see on the live site. */
export function buildLiveAdventurePreviewUrl(adventureId: string): string {
  const params = new URLSearchParams();
  params.set(PREVIEW_ADVENTURE_PARAM, adventureId);
  params.set(PREVIEW_MODE_LIVE, 'true');
  return `${FAMILY_HUB_PATH}/weekly-adventures?${params.toString()}`;
}

/** Stable admin portal route that redirects into the family hub preview. */
export function buildAdminPortalAdventurePreviewPath(
  adventureId: string,
  mode: 'admin' | 'live' = 'admin',
): string {
  return `${ADMIN_PORTAL_PATH}/adventures/${encodeURIComponent(adventureId)}/preview?mode=${mode}`;
}
