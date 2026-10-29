import { STORY_BOOKS_CLAIM_PATH } from '../config/courageRoutes';

let claimTokenHandoff = '';

/** Copy a claim token into memory and remove it from the address bar before analytics starts. */
export function captureAcademyClaimToken(): string {
  if (typeof window === 'undefined') return claimTokenHandoff;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const fromHash = params.get('token') || '';
  const onClaimPage = window.location.pathname === STORY_BOOKS_CLAIM_PATH;
  if (fromHash && onClaimPage) {
    claimTokenHandoff = fromHash;
    params.delete('token');
    const hash = params.toString();
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ''}`,
    );
  }
  return onClaimPage ? fromHash || claimTokenHandoff : '';
}
