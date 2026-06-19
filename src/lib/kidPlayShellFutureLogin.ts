/**
 * Future Kid Play Shell login expansion — not implemented yet.
 *
 * TODO(child-nickname): Allow child to pick their nickname avatar on a dedicated kid login screen.
 * TODO(child-pin): Add optional child PIN for quick re-entry on home devices without parent email.
 * TODO(pwa-login): Support installed PWA shortcut that opens kid shell with device-bound session token.
 * TODO(child-owned-device): Route future_child_pin sessions to child_owned_device with softer parent gates.
 */

export const KID_PLAY_SHELL_FUTURE_LOGIN_TODOS = [
  'child-nickname',
  'child-pin',
  'pwa-login',
  'child-owned-device',
] as const;
