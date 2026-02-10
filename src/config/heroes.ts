/**
 * Global kill switch for hero images. When true, hero background images
 * are not rendered; a solid background is shown instead (layout unchanged).
 */
export const DISABLE_HEROES = process.env.REACT_APP_DISABLE_HEROES === 'true';
