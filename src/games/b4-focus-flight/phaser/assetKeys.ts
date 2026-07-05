export const B4_ASSET_BASE_PATH = '/images/B-4FlightGame';
export const B4_ICON_BASE_PATH = '/images/icons';

export const B4_ASSET_KEYS = {
  idle: 'b4-asset-idle',
  blinking: 'b4-asset-blinking',
  happy: 'b4-asset-happy',
  hurt: 'b4-asset-hurt',
  sparkFlame: 'b4-asset-sparkle-flame',
  anchorFlame: 'b4-asset-anchor-flame',
  emberFlame: 'b4-asset-ember-flame',
  cloudObstacle: 'b4-asset-cloud-obstacle',
  logObstacle: 'b4-asset-log-obstacle',
  gameplayBackground: 'b4-asset-gameplay-background',
} as const;

export const B4_AUDIO_KEYS = {
  ambient: 'b4-audio-focus-flame-ambient',
  button: 'b4-audio-card-hover-bubble',
  success: 'b4-audio-game-success-win',
} as const;

export const B4_PROCESSED_ASSET_KEYS = {
  idle: 'b4-asset-idle-clean',
  blinking: 'b4-asset-blinking-clean',
  happy: 'b4-asset-happy-clean',
  hurt: 'b4-asset-hurt-clean',
  sparkFlame: 'b4-asset-sparkle-flame-clean',
  anchorFlame: 'b4-asset-anchor-flame-clean',
  emberFlame: 'b4-asset-ember-flame-clean',
  cloudObstacle: 'b4-asset-cloud-obstacle-clean',
  logObstacle: 'b4-asset-log-obstacle-clean',
} as const;

export const B4_ASSET_SOURCES = [
  {
    key: B4_ASSET_KEYS.idle,
    folder: 'Idle',
    file: 'Idle@2x-transparent.png',
    label: 'B-4 idle',
  },
  {
    key: B4_ASSET_KEYS.blinking,
    folder: 'Blinking',
    file: 'Blinking@2x.png',
    label: 'B-4 blinking',
  },
  {
    key: B4_ASSET_KEYS.happy,
    folder: 'Happy',
    file: 'Happy@2x.png',
    label: 'B-4 happy',
  },
  {
    key: B4_ASSET_KEYS.hurt,
    folder: 'Hurt',
    file: 'Hurt@2x.png',
    label: 'B-4 hurt',
  },
  {
    key: B4_ASSET_KEYS.sparkFlame,
    folder: 'FocusFlameIcon',
    file: 'focus-flame-transparent.png',
    url: `${B4_ICON_BASE_PATH}/FocusFlameIcon/focus-flame-transparent.png`,
    label: 'Sparkle Flame',
  },
  {
    key: B4_ASSET_KEYS.anchorFlame,
    folder: 'Anchor Flame',
    file: 'Anchor Flame@2x.png',
    label: 'Anchor Flame',
  },
  {
    key: B4_ASSET_KEYS.emberFlame,
    folder: 'Ember-Flame',
    file: 'Ember-Flame@2x.png',
    label: 'Ember Flame',
  },
  {
    key: B4_ASSET_KEYS.cloudObstacle,
    folder: 'Clouds',
    file: 'Cloud@2x.png',
    label: 'Cloud obstacle',
  },
  {
    key: B4_ASSET_KEYS.logObstacle,
    folder: 'logs',
    file: 'logos@2x.png',
    label: 'Log obstacle',
  },
] as const;

export const resolveB4AssetUrl = (folder: string, file: string): string =>
  encodeURI(`${B4_ASSET_BASE_PATH}/${folder}/${file}`);

export const B4_AUDIO_BASE_PATH = '/audio';

export const B4_AUDIO_SOURCES = [
  {
    key: B4_AUDIO_KEYS.ambient,
    file: 'focus-flame-ambient.mp3',
  },
  {
    key: B4_AUDIO_KEYS.button,
    file: 'card-hover-bubble.mp3',
  },
  {
    key: B4_AUDIO_KEYS.success,
    file: 'Game Success Win.wav',
  },
] as const;

export const resolveB4AudioUrl = (file: string): string =>
  encodeURI(`${B4_AUDIO_BASE_PATH}/${file}`);

export const B4_BACKGROUND_SOURCE = {
  key: B4_ASSET_KEYS.gameplayBackground,
  folder: 'background',
  file: 'GameplayBackgrounds.webp',
  label: 'cinematic gameplay background',
} as const;

export const B4_BACKGROUND_LAYER_SOURCES = [
  {
    key: 'b4-bg-layer-sky',
    label: 'Sky',
    speed: 0.02,
    files: ['Sky', 'sky'],
  },
  {
    key: 'b4-bg-layer-stars',
    label: 'Stars',
    speed: 0.05,
    files: ['Stars', 'stars'],
    blend: 'add',
    alpha: 0.42,
  },
  {
    key: 'b4-bg-layer-clouds',
    label: 'Clouds',
    speed: 0.1,
    files: ['Clouds', 'clouds'],
    blend: 'add',
    alpha: 0.64,
  },
  {
    key: 'b4-bg-layer-mountains-far',
    label: 'Mountains_Far',
    speed: 0.18,
    files: ['Mountains_Far', 'mountains_far', 'mountains-far'],
  },
  {
    key: 'b4-bg-layer-mountains-mid',
    label: 'Mountains_Mid',
    speed: 0.28,
    files: ['Mountains_Mid', 'mountains_mid', 'mountains-mid'],
  },
  {
    key: 'b4-bg-layer-trees-far',
    label: 'Trees_Far',
    speed: 0.45,
    files: ['Trees_Far', 'trees_far', 'trees-far'],
  },
  {
    key: 'b4-bg-layer-trees-mid',
    label: 'Trees_Mid',
    speed: 0.65,
    files: ['Trees_Mid', 'trees_mid', 'trees-mid'],
  },
  {
    key: 'b4-bg-layer-fog',
    label: 'Fog',
    speed: 0.75,
    files: ['Fog', 'fog'],
    alpha: 0.62,
    blend: 'add',
  },
  {
    key: 'b4-bg-layer-foreground-leaves',
    label: 'Foreground_Leaves',
    speed: 0.9,
    files: ['Foreground_Leaves', 'foreground_leaves', 'foreground-leaves', 'forground_leaves'],
  },
  {
    key: 'b4-bg-layer-rain',
    label: 'Rain',
    speed: 1,
    files: ['Rain', 'rain'],
    alpha: 0.72,
    blend: 'add',
  },
] as const;

export const B4_BACKGROUND_LAYER_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg'] as const;

export const resolveB4BackgroundLayerUrl = (fileStem: string, extension: string): string =>
  encodeURI(`${B4_ASSET_BASE_PATH}/background/layers/${fileStem}.${extension}`);
