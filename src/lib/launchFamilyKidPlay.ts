import type { NavigateFunction } from 'react-router-dom';
import { kidPlaySessionStartPath } from '../config/courageRoutes';
import { resolveFamilyKidPlayLaunch } from './familyKidPlayLaunch';
import { setKidPlayFamilySoftLocked } from './kidPlayFamilySoftLock';
import { kidShellAwareNavigate } from './kidShellNav';
import { writeKidPlayFamilyReturnBase } from './kidPlayShellRoutes';

export type LaunchFamilyKidPlayResult =
  | { ok: true }
  | { ok: false; message: string; supportCode?: string | null };

/** Resolve/create a family Kid Shell session and navigate to full-screen weekly adventures. */
export async function launchFamilyKidPlay(input: {
  childId: string;
  returnPath: string;
  navigate: NavigateFunction;
}): Promise<LaunchFamilyKidPlayResult> {
  const childId = input.childId.trim();
  if (!childId) {
    return { ok: false, message: 'Choose a player before starting Weekly Adventures.' };
  }

  const result = await resolveFamilyKidPlayLaunch({ childId });
  if (result.kind === 'error') {
    return { ok: false, message: result.message, supportCode: result.supportCode };
  }

  setKidPlayFamilySoftLocked(false);
  writeKidPlayFamilyReturnBase(input.returnPath);
  kidShellAwareNavigate(input.navigate, kidPlaySessionStartPath(result.session.id), {
    state: { fromFamilyPortal: input.returnPath },
  });
  return { ok: true };
}
