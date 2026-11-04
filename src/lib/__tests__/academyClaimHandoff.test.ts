import { captureAcademyClaimToken, releaseAcademyClaimToken } from '../academyClaimHandoff';

describe('academy claim handoff', () => {
  beforeEach(() => {
    releaseAcademyClaimToken();
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  test('removes the invitation token from the claim url and from browser storage', () => {
    window.history.replaceState(null, '', '/story/books/claim#token=invite-fixture-token');
    expect(captureAcademyClaimToken()).toBe('invite-fixture-token');
    expect(window.location.pathname).toBe('/story/books/claim');
    expect(window.location.hash).toBe('');
    expect(window.location.href).not.toContain('invite-fixture-token');
    expect(JSON.stringify(window.localStorage)).not.toContain('invite-fixture-token');
    expect(JSON.stringify(window.sessionStorage)).not.toContain('invite-fixture-token');

    releaseAcademyClaimToken();
    expect(captureAcademyClaimToken()).toBe('');
  });

  test('does not keep an invitation token seen on another page', () => {
    window.history.replaceState(null, '', '/story/books#token=invite-fixture-token');
    expect(captureAcademyClaimToken()).toBe('');
    window.history.replaceState(null, '', '/story/books/claim');
    expect(captureAcademyClaimToken()).toBe('');
  });
});
