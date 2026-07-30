import {
  isApprovedPopupMarketingRoute,
  isCourageToolsPopupEligible,
} from '../courageToolsPopupEligibility';

describe('Courage tools marketing popup eligibility', () => {
  test.each([
    '/admin',
    '/admin/pilot-outcomes',
    '/program-dashboard',
    '/program-dashboard/roster',
    '/family-portal',
    '/play/session/session-1/weekly-adventures',
    '/portal',
    '/login',
    '/signup',
    '/account/claim',
    '/invite/accept',
    '/password/reset',
    '/kids',
    '/games',
  ])('never approves protected or account route %s', (pathname) => {
    expect(isApprovedPopupMarketingRoute(pathname)).toBe(false);
    expect(isCourageToolsPopupEligible({
      pathname,
      authenticationLoading: false,
      authenticated: false,
      applicationSessionExists: false,
    })).toBe(false);
  });

  test.each(['/', '/about', '/resources', '/parents', '/teachers', '/camps', '/schools'])(
    'allows unauthenticated marketing route %s',
    (pathname) => {
      expect(isCourageToolsPopupEligible({
        pathname,
        authenticationLoading: false,
        authenticated: false,
        applicationSessionExists: false,
      })).toBe(true);
    },
  );

  test('stays hidden while auth resolves or any application session exists', () => {
    expect(isCourageToolsPopupEligible({
      pathname: '/',
      authenticationLoading: true,
      authenticated: false,
      applicationSessionExists: false,
    })).toBe(false);
    expect(isCourageToolsPopupEligible({
      pathname: '/',
      authenticationLoading: false,
      authenticated: true,
      applicationSessionExists: false,
    })).toBe(false);
    expect(isCourageToolsPopupEligible({
      pathname: '/',
      authenticationLoading: false,
      authenticated: false,
      applicationSessionExists: true,
    })).toBe(false);
  });
});
