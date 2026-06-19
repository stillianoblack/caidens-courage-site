import type { NavigateFunction } from 'react-router-dom';
import {
  getKidPlayShellRoute,
  type KidPlayShellModuleId,
} from './kidPlayShellRoutes';
import type { KidPlaySessionRow } from './kidPlaySessionTypes';

export type KidPlayResumePayload = {
  route?: string;
  module?: KidPlayShellModuleId | 'kids';
  week?: number;
  endedFrom?: string;
  characterId?: string;
  missionId?: string;
};

export function parseKidPlayResumePayload(
  resume: Record<string, unknown> | null | undefined,
): KidPlayResumePayload | null {
  if (!resume || typeof resume !== 'object') return null;
  return {
    route: typeof resume.route === 'string' ? resume.route : undefined,
    module:
      typeof resume.module === 'string'
        ? (resume.module as KidPlayResumePayload['module'])
        : undefined,
    week: typeof resume.week === 'number' ? resume.week : undefined,
    endedFrom: typeof resume.endedFrom === 'string' ? resume.endedFrom : undefined,
    characterId: typeof resume.characterId === 'string' ? resume.characterId : undefined,
    missionId: typeof resume.missionId === 'string' ? resume.missionId : undefined,
  };
}

export function applyKidPlaySessionResume(
  navigate: NavigateFunction,
  session: KidPlaySessionRow,
  resume: KidPlayResumePayload | null,
): boolean {
  const sessionId = session.id;

  if (resume?.route?.startsWith(`/play/session/${sessionId}`)) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[KID_SHELL_RESUME]', {
        sessionId,
        restored: true,
        reason: 'route',
        route: resume.route,
        module: resume.module ?? null,
      });
    }
    navigate(resume.route, { replace: true });
    return true;
  }

  if (resume?.module === 'kids' && resume.characterId && resume.missionId) {
    const route = getKidPlayShellRoute(sessionId, 'kids', {
      characterId: resume.characterId,
      missionId: resume.missionId,
    });
    if (process.env.NODE_ENV === 'development') {
      console.info('[KID_SHELL_RESUME]', {
        sessionId,
        restored: true,
        reason: 'kids_mission',
        route,
        module: 'kids',
      });
    }
    navigate(route, { replace: true });
    return true;
  }

  if (resume?.module && resume.module !== 'kids') {
    const route = getKidPlayShellRoute(sessionId, resume.module, {
      week: resume.week,
      search: resume.week ? `?week=${resume.week}` : undefined,
    });
    if (process.env.NODE_ENV === 'development') {
      console.info('[KID_SHELL_RESUME]', {
        sessionId,
        restored: true,
        reason: 'module',
        route,
        module: resume.module,
      });
    }
    navigate(route, { replace: true });
    return true;
  }

  if (process.env.NODE_ENV === 'development') {
    console.info('[KID_SHELL_RESUME]', {
      sessionId,
      restored: false,
      reason: 'fallback_weekly',
      route: getKidPlayShellRoute(sessionId, 'weekly-adventures'),
      module: 'weekly-adventures',
    });
  }
  return false;
}
