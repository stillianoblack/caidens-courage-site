/**
 * Developer shortcuts are available in the local dev server and in builds that
 * explicitly opt in. Production does not set the opt-in variable, so preview
 * routes are not added to the router at all.
 */
export const ENABLE_DEVELOPMENT_PREVIEWS =
  process.env.NODE_ENV === 'development' ||
  process.env.REACT_APP_ENABLE_DEVELOPMENT_PREVIEWS === 'true';
