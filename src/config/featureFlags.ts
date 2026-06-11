/**
 * Pilot phase: conversational Ask B-4 chat (floating widget, dashboard prompts, /chat marketing).
 * Set REACT_APP_ENABLE_B4_CHAT=true to re-enable after pilot.
 * B-4 check-ins, assessments, and in-game guidance are unaffected.
 */
export const ENABLE_B4_CHAT = process.env.REACT_APP_ENABLE_B4_CHAT === 'true';

/** Filter marketing/path cards that launch Ask B-4 chat. */
export function withoutB4ChatCards<T extends { title: string; ctaTo?: string }>(cards: T[]): T[] {
  if (ENABLE_B4_CHAT) return cards;
  return cards.filter((card) => card.title !== 'Ask B-4' && card.ctaTo !== '/chat');
}

/** Filter portal unlock dashboard resources that link to chat. */
export function withoutB4ChatResources<T extends { title: string; href?: string }>(
  resources: T[],
): T[] {
  if (ENABLE_B4_CHAT) return resources;
  return resources.filter((item) => item.title !== 'Ask B-4' && item.href !== '/chat');
}

/** Filter marketing bullet lists that mention Ask B-4. */
export function withoutB4ChatBullets(bullets: string[]): string[] {
  if (ENABLE_B4_CHAT) return bullets;
  return bullets.filter((bullet) => bullet !== 'Ask B-4');
}
