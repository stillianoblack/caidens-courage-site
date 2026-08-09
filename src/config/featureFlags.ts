/**
 * Pilot phase: conversational Ask B-4 chat (floating widget, dashboard prompts, /chat marketing).
 * The conversational chatbot is intentionally hidden for performance.
 * Flip this constant back to the env check when you are ready to re-enable it.
 * B-4 check-ins, assessments, and in-game guidance are unaffected.
 */
export const ENABLE_B4_CHAT = false;

/** Blocking post-login goal selection is intentionally retired. Manual goal editing remains available. */
export const ENABLE_INITIAL_GOAL_SELECTION =
  process.env.REACT_APP_ENABLE_INITIAL_GOAL_SELECTION === 'true';

/** Additive Auth ownership is opt-in until staging authorization is verified. */
export const ENABLE_PORTAL_AUTH_OWNERSHIP =
  process.env.REACT_APP_PORTAL_AUTH_OWNERSHIP_ENABLED === 'true';

/** Access-code flows remain available during the transition unless explicitly disabled. */
export const ENABLE_PORTAL_ACCESS_CODE_COMPATIBILITY =
  process.env.REACT_APP_PORTAL_ACCESS_CODE_COMPATIBILITY_ENABLED !== 'false';

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
