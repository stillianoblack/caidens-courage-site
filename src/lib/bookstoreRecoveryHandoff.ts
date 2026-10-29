import { STORY_BOOKS_DOWNLOAD_PATH } from '../config/courageRoutes';

let recoveryTokenHandoff = '';
let clearRecoveryTokenHandoff: ReturnType<typeof setTimeout> | null = null;

/** Copy a download token into memory and remove it from the address bar before analytics starts. */
export function captureBookstoreRecoveryToken(): string {
  if (typeof window === 'undefined') return recoveryTokenHandoff;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const fromHash = params.get('token') || '';
  const onDownloadPage = window.location.pathname === STORY_BOOKS_DOWNLOAD_PATH;
  if (fromHash && onDownloadPage) {
    recoveryTokenHandoff = fromHash;
    params.delete('token');
    const hash = params.toString();
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ''}`,
    );
  }
  return onDownloadPage ? fromHash || recoveryTokenHandoff : '';
}

export function scheduleClearBookstoreRecoveryToken(): void {
  if (clearRecoveryTokenHandoff) clearTimeout(clearRecoveryTokenHandoff);
  clearRecoveryTokenHandoff = setTimeout(() => {
    recoveryTokenHandoff = '';
    clearRecoveryTokenHandoff = null;
  }, 0);
}

export function cancelClearBookstoreRecoveryToken(): void {
  if (!clearRecoveryTokenHandoff) return;
  clearTimeout(clearRecoveryTokenHandoff);
  clearRecoveryTokenHandoff = null;
}
