import { captureBookstoreRecoveryToken } from '../bookstoreRecoveryHandoff';

describe('bookstore recovery handoff', () => {
  test('removes a download token from the URL before it can be tracked', () => {
    window.history.replaceState(null, '', '/story/books/download?checkout=success#token=secret-token');
    expect(captureBookstoreRecoveryToken()).toBe('secret-token');
    expect(window.location.pathname).toBe('/story/books/download');
    expect(window.location.search).toBe('?checkout=success');
    expect(window.location.hash).toBe('');
    expect(window.location.href).not.toContain('secret-token');
  });

  test('does not keep a token that appears on another page', () => {
    window.history.replaceState(null, '', '/story/books#token=other-page-token');
    expect(captureBookstoreRecoveryToken()).toBe('');
    expect(window.location.hash).toBe('#token=other-page-token');
  });
});
