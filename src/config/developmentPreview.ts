/**
 * Developer shortcuts are available in the local dev server and in builds that
 * explicitly opt in. Production does not set the opt-in variable, so preview
 * routes are not added to the router at all.
 */
const netlifyContext = String(process.env.REACT_APP_NETLIFY_CONTEXT || '')
  .trim()
  .toLowerCase();

export const ENABLE_DEVELOPMENT_PREVIEWS =
  process.env.NODE_ENV === 'development' ||
  netlifyContext === 'deploy-preview' ||
  netlifyContext === 'branch-deploy' ||
  process.env.REACT_APP_ENABLE_DEVELOPMENT_PREVIEWS === 'true';
