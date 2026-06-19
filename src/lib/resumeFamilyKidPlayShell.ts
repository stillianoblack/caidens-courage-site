import type { NavigateFunction } from 'react-router-dom';
import { resolveFamilyKidPlayLaunch } from './familyKidPlayLaunch';
import {
  clearKidPlayFamilyResumePayload,
  readKidPlayFamilyResumePayload,
  remapKidPlayResumeRoute,
} from './kidPlayFamilyResume';
import { setKidPlayFamilySoftLocked } from './kidPlayFamilySoftLock';
import { getKidPlayShellRoute, writeKidPlayFamilyReturnBase } from './kidPlayShellRoutes';

export type ResumeFamilyKidPlayShellResult =
  | { ok: true }
  | { ok: false; message: string };

export async function resumeFamilyKidPlayShell(
  navigate: NavigateFunction,
  input: {
    childId: string;
    familyReturnPath: string;
  },
): Promise<ResumeFamilyKidPlayShellResult> {
  const childId = input.childId.trim();
  if (!childId) {
    return { ok: false, message: 'Choose a player to continue.' };
  }

  const storedResume = readKidPlayFamilyResumePayload();
  const launch = await resolveFamilyKidPlayLaunch({ childId });

  if (launch.kind === 'error') {
    return { ok: false, message: launch.message };
  }

  setKidPlayFamilySoftLocked(false);
  writeKidPlayFamilyReturnBase(input.familyReturnPath);

  const sessionId = launch.session.id;
  const remappedRoute = remapKidPlayResumeRoute(storedResume?.route, sessionId);
  const fallbackModule =
    storedResume?.module && storedResume.module !== 'kids'
      ? storedResume.module
      : 'weekly-adventures';
  const fallbackRoute = getKidPlayShellRoute(sessionId, fallbackModule, {
    week: storedResume?.week,
    search: storedResume?.week ? `?week=${storedResume.week}` : undefined,
  });

  clearKidPlayFamilyResumePayload();
  navigate(remappedRoute ?? fallbackRoute, { replace: true });

  if (process.env.NODE_ENV === 'development') {
    console.info('[KID_PLAY_FAMILY_RESUME]', {
      sessionId,
      route: remappedRoute ?? fallbackRoute,
      usedStoredRoute: Boolean(remappedRoute),
      module: storedResume?.module ?? fallbackModule,
    });
  }

  return { ok: true };
}
