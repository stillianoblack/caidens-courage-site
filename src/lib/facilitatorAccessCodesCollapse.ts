const COLLAPSED_PREFIX = 'facilitator_access_codes_collapsed_';
const HINT_SEEN_PREFIX = 'facilitator_access_codes_hint_seen_';

export function accessCodesCollapsedKey(programCode: string): string {
  return `${COLLAPSED_PREFIX}${programCode.trim()}`;
}

export function accessCodesHintSeenKey(programCode: string): string {
  return `${HINT_SEEN_PREFIX}${programCode.trim()}`;
}

export function readAccessCodesCollapsed(programCode: string): boolean {
  try {
    return localStorage.getItem(accessCodesCollapsedKey(programCode)) === 'true';
  } catch {
    return false;
  }
}

export function writeAccessCodesCollapsed(programCode: string, collapsed: boolean): void {
  try {
    localStorage.setItem(accessCodesCollapsedKey(programCode), collapsed ? 'true' : 'false');
  } catch {
    /* localStorage unavailable */
  }
}

export function readAccessCodesHintSeen(programCode: string): boolean {
  try {
    return localStorage.getItem(accessCodesHintSeenKey(programCode)) === 'true';
  } catch {
    return false;
  }
}

export function writeAccessCodesHintSeen(programCode: string): void {
  try {
    localStorage.setItem(accessCodesHintSeenKey(programCode), 'true');
  } catch {
    /* localStorage unavailable */
  }
}
