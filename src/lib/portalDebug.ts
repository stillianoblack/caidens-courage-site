import { readActivePortalRole } from '../config/portalContext';
import { maskAccessCode } from '../config/lastPilotProgram';
import type { PilotProgramLookupResponse } from './pilotProgramService';

const DEBUG_PREFIX = '[PORTAL_DEBUG]';

export function isPortalDebugEnabled(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export function portalDebug(label: string, payload?: Record<string, unknown>): void {
  if (!isPortalDebugEnabled()) return;
  if (payload) {
    console.log(DEBUG_PREFIX, label, payload);
  } else {
    console.log(DEBUG_PREFIX, label);
  }
}

export function logPortalRouteContext(pathname: string): void {
  portalDebug('route', {
    pathname,
    activePortalRole: readActivePortalRole() ?? '(none)',
  });
}

export function logPortalRedirect(from: string, to: string, reason: string): void {
  portalDebug('redirect', {
    from,
    to,
    reason,
    activePortalRole: readActivePortalRole() ?? '(none)',
  });
}

type CodeLookupLog = {
  status: PilotProgramLookupResponse['status'];
  matched: boolean;
  programCode?: string;
};

export function logFamilyCodeLookup(rawCode: string, lookup: CodeLookupLog): void {
  portalDebug('family code lookup', {
    code: maskAccessCode(rawCode),
    ...lookup,
  });
}

export function logFacilitatorCodeLookup(rawCode: string, lookup: CodeLookupLog): void {
  portalDebug('facilitator code lookup', {
    code: maskAccessCode(rawCode),
    ...lookup,
  });
}

export function logProgramCodeLookup(
  rawCode: string,
  response: PilotProgramLookupResponse,
): void {
  const family: CodeLookupLog = {
    status: response.status,
    matched: response.result?.role === 'family',
    programCode: response.result?.role === 'family' ? response.result.program.programCode : undefined,
  };
  const facilitator: CodeLookupLog = {
    status: response.status,
    matched: response.result?.role === 'facilitator',
    programCode:
      response.result?.role === 'facilitator' ? response.result.program.programCode : undefined,
  };

  logFamilyCodeLookup(rawCode, family);
  logFacilitatorCodeLookup(rawCode, facilitator);
}
