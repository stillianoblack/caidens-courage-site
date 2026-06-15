import type { ProgramSettingsTabId } from '../components/pilot-dashboard/PilotProgramSettingsDrawer';

export const OPEN_FACILITATOR_PROGRAM_SETTINGS_EVENT = 'caidens:open-facilitator-program-settings';

export function openFacilitatorProgramSettings(tab: ProgramSettingsTabId = 'access-codes'): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(OPEN_FACILITATOR_PROGRAM_SETTINGS_EVENT, { detail: { tab } }),
  );
}
