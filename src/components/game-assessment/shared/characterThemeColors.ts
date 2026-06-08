import type { MissionGameTheme } from '../../mission-game/MissionSpeechRow';

export const CHARACTER_THEME_COLORS: Record<MissionGameTheme | 'zeke', string> = {
  caiden: '#e5c06a',
  miranda: '#7c6aad',
  b4: '#4a90c4',
  charlie: '#5cb85c',
  zeke: '#60a5fa',
  victoria: '#d99bc7',
  'uncle-t': '#c9732d',
  default: '#243e70',
};

export function resolveCharacterThemeColor(theme?: string): string {
  if (!theme) return CHARACTER_THEME_COLORS.default;
  return CHARACTER_THEME_COLORS[theme as keyof typeof CHARACTER_THEME_COLORS] ?? CHARACTER_THEME_COLORS.default;
}
