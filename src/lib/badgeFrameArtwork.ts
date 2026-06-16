export type BadgeFrameShape = 'circle' | 'shield' | 'medal' | 'crest';

const FRAME_SHAPES: BadgeFrameShape[] = ['shield', 'medal', 'crest', 'circle'];

export function resolveBadgeFrameShape(
  kind: 'check-in' | 'weekly' | 'monthly',
  weekNumber: number | null,
): BadgeFrameShape {
  if (kind === 'monthly') return 'crest';
  if (kind === 'check-in') return 'medal';
  if (!weekNumber || weekNumber < 1) return 'shield';
  return FRAME_SHAPES[(weekNumber - 1) % FRAME_SHAPES.length];
}
