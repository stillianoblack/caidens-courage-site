import type { FocusFlameMove } from './focusFlameMoves';

export type FocusFlameSceneId = 'move' | 'ceremony' | 'cave';

/** Every clip under `public/audio/b4/` (filename without `.mp3`). */
export const B4_CLIP_SLUGS = [
  'intro-welcome',
  'scene-intro',
  'watch-scene',
  'flame-start',
  'scene-move',
  'scene-ceremony',
  'scene-cave',
  'feeling-prompt',
  'body-prompt',
  'focus-move-prompt',
  'reward-screen',
  'practice-start',
  'end-encouragement',
  'real-life-reminder',
  'flame-tap-intro',
  'flame-tap-1',
  'flame-tap-2',
  'flame-tap-3',
  'flame-steady-success',
  'mission-intro',
  'mission-complete',
  'why-feeling',
  'why-body',
  'why-move',
  'reflection-correct',
  'spark-breath',
  'b4-pause',
  'b4-pause-countdown',
  'b4-pause-success',
  'flame-draw',
  'flame-draw-success',
  'brave-choice',
  'brave-choice-success',
  'focus-points-earned',
  'ui-confirm',
] as const;

export type B4ClipSlug = (typeof B4_CLIP_SLUGS)[number];

/** Screen narration keys (slug = filename). */
export const FOCUS_FLAME_B4_SCREEN_SLUGS = [
  'intro-welcome',
  'feeling-prompt',
  'body-prompt',
  'focus-move-prompt',
  'reward-screen',
] as const;

export type FocusFlameB4ScreenSlug = (typeof FOCUS_FLAME_B4_SCREEN_SLUGS)[number];

/** Original per-adventure narration when Caiden steps into a scene. */
export const SCENE_ADVENTURE_CLIP_BY_ID: Record<FocusFlameSceneId, B4ClipSlug> = {
  move: 'scene-move',
  ceremony: 'scene-ceremony',
  cave: 'scene-cave',
};

export function sceneAdventureB4Clip(sceneId: FocusFlameSceneId): B4ClipSlug {
  return SCENE_ADVENTURE_CLIP_BY_ID[sceneId];
}

export const FLAME_TAP_CLIP_SLUGS = [
  'flame-tap-intro',
  'flame-tap-1',
  'flame-tap-2',
  'flame-tap-3',
] as const;

export type FlameTapClipSlug = (typeof FLAME_TAP_CLIP_SLUGS)[number];

/** Legacy camelCase keys → clip slugs (flame tap). */
export const FLAME_TAP_CLIP_BY_KEY = {
  flameTapIntro: 'flame-tap-intro',
  flameTap1: 'flame-tap-1',
  flameTap2: 'flame-tap-2',
  flameTap3: 'flame-tap-3',
} as const satisfies Record<string, FlameTapClipSlug>;

export type FlameTapB4VoiceKey = keyof typeof FLAME_TAP_CLIP_BY_KEY;

/** Real-life practice: clip played when the move activity completes. */
export const PRACTICE_SUCCESS_CLIP_BY_MOVE: Record<FocusFlameMove, B4ClipSlug> = {
  'Spark Breath': 'end-encouragement',
  'Anchor Step': 'end-encouragement',
  'B-4 Pause': 'b4-pause-success',
  'Flame Draw': 'flame-draw-success',
  'Brave Choice': 'brave-choice-success',
};

/** Clip played when the child starts the move activity (tap / hold). */
export const PRACTICE_ACTIVITY_CLIP_BY_MOVE: Partial<Record<FocusFlameMove, B4ClipSlug>> = {
  'Spark Breath': 'spark-breath',
  'B-4 Pause': 'b4-pause',
  'Flame Draw': 'flame-draw',
  'Brave Choice': 'brave-choice',
};

/** Short clips that play over narration without stopping it (UI feedback only). */
export const B4_OVERLAY_CLIP_SLUGS = ['ui-confirm'] as const;

export type B4OverlayClipSlug = (typeof B4_OVERLAY_CLIP_SLUGS)[number];

export function isB4OverlayClip(slug: B4ClipSlug): slug is B4OverlayClipSlug {
  return (B4_OVERLAY_CLIP_SLUGS as readonly string[]).includes(slug);
}
