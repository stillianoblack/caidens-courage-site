/**
 * Staging content is OFF by default. Enable for local review:
 *   REACT_APP_STAGING_QUESTIONS=true yarn start
 */
export const STAGING_CONTENT_ENABLED =
  process.env.REACT_APP_STAGING_QUESTIONS === 'true';

export const STAGING_CONTENT_VERSION = 'adaptive_staging_v4_difficulty' as const;
