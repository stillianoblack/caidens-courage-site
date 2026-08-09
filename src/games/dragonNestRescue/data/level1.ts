export const LEVEL_WIDTH = 2700;
export const LEVEL_HEIGHT = 1600;

export const FLAME_POINTS = [
  [340, 730], [510, 610], [690, 480], [900, 650], [1080, 820], [1240, 650],
  [1420, 470], [1580, 720], [1780, 560], [2040, 760], [2260, 620], [2470, 790],
] as const;

export const CHECKPOINTS = [
  { id: 1, x: 820, y: 720, label: 'First Flame Gate' },
  { id: 2, x: 1690, y: 690, label: 'Dragon Trail' },
] as const;

export const CLUES = [
  { id: 'footprint', x: 1070, y: 520, label: 'Dragon footprint', message: 'Those tracks are small. We might be close.' },
  { id: 'scale', x: 1480, y: 820, label: 'Glowing scale', message: 'A warm dragon scale. The trail keeps going this way.' },
  { id: 'crystal', x: 1840, y: 470, label: 'Warm crystal', message: "Something's ahead… and this crystal is glowing." },
] as const;

export const ROCKS = [
  [610, 930, 100, 150], [920, 300, 170, 95], [1320, 980, 180, 110],
  [1540, 250, 120, 160], [1940, 1020, 190, 100], [2250, 330, 160, 120],
] as const;

export const CRACKED_ZONES = [
  { x: 1180, y: 720, width: 220, height: 170 },
  { x: 2110, y: 690, width: 210, height: 160 },
] as const;

export const WIND_ZONE = { x: 1450, y: 520, width: 360, height: 360 } as const;
export const BABY_DRAGON_POINT = { x: 2110, y: 480 } as const;
export const NEST_POINT = { x: 2520, y: 760 } as const;
