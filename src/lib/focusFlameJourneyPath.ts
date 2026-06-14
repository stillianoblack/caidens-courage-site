const PATH_CHOSEN_KEY = 'focusFlame:journey:pathChosen';

export function readJourneyPathChosen(programCode?: string, childId?: string | null): boolean {
  if (typeof window === 'undefined') return false;
  const key = `${PATH_CHOSEN_KEY}:${programCode ?? 'default'}:${childId ?? 'default'}`;
  return localStorage.getItem(key) === 'true';
}

export function writeJourneyPathChosen(programCode?: string, childId?: string | null): void {
  if (typeof window === 'undefined') return;
  const key = `${PATH_CHOSEN_KEY}:${programCode ?? 'default'}:${childId ?? 'default'}`;
  localStorage.setItem(key, 'true');
}
