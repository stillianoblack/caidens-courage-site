export const ACTIVE_CHILD_NICKNAME_KEY = 'activeChildNickname';

export function readActiveChildNickname(): string {
  try {
    const raw = localStorage.getItem(ACTIVE_CHILD_NICKNAME_KEY);
    return raw?.trim() ?? '';
  } catch {
    return '';
  }
}

export function writeActiveChildNickname(nickname: string): void {
  try {
    const trimmed = nickname.trim();
    if (trimmed) {
      localStorage.setItem(ACTIVE_CHILD_NICKNAME_KEY, trimmed);
    } else {
      localStorage.removeItem(ACTIVE_CHILD_NICKNAME_KEY);
    }
  } catch {
    /* localStorage unavailable */
  }
}
