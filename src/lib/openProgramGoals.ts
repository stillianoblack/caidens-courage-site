export const OPEN_PROGRAM_GOALS_EVENT = 'caidens:open-program-goals';

export function openProgramGoals(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_PROGRAM_GOALS_EVENT));
}
