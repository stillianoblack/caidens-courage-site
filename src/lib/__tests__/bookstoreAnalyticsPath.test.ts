import { sanitizeAnalyticsPagePath } from '../analytics';

describe('bookstore recovery analytics', () => {
  test('removes recovery tokens and checkout session ids from page paths', () => {
    expect(sanitizeAnalyticsPagePath('/story/books/download#token=secret-token')).toBe('/story/books/download');
    expect(sanitizeAnalyticsPagePath('/story/books/download?session_id=cs_test_123&checkout=success')).toBe(
      '/story/books/download?checkout=success',
    );
    expect(sanitizeAnalyticsPagePath('/portal/facilitator#weekly-modules')).toBe('/portal/facilitator#weekly-modules');
  });
});