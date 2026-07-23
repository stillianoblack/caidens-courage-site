export const KID_PLAY_B4_PICKER_REQUEST_EVENT = 'kid-play:b4-picker-requested';

export function requestKidPlayB4Picker(): void {
  window.dispatchEvent(new Event(KID_PLAY_B4_PICKER_REQUEST_EVENT));
}
