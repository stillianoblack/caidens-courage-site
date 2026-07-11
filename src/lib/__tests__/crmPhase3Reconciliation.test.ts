// eslint-disable-next-line @typescript-eslint/no-var-requires
const { buildReconciliationPreview } = require('../../../netlify/functions/_lib/kitReconciliation');
export {};
describe('Kit subscriber reconciliation preview', () => {
  test('reports exact, ambiguous, unmatched and restrictive conflicts without writes', () => {
    const rows = buildReconciliationPreview([
      { id: '1', primary_email: 'a@example.com', communication_status: 'confirmed' },
      { id: '2', primary_email: 'dup@example.com', communication_status: 'unknown' },
      { id: '3', primary_email: 'dup@example.com', communication_status: 'unknown' },
      { id: '4', primary_email: 'local@example.com', communication_status: 'unsubscribed' },
    ], [{ id: 10, email_address: 'a@example.com', state: 'active' }, { id: 11, email_address: 'dup@example.com', state: 'active' }, { id: 12, email_address: 'remote@example.com', state: 'cancelled' }, { id: 13, email_address: 'local@example.com', state: 'active' }]);
    expect(rows.find((r: any) => r.remote_subscriber_id === '10').proposed_action).toBe('link_existing');
    expect(rows.find((r: any) => r.remote_subscriber_id === '11').proposed_action).toBe('manual_review');
    expect(rows.find((r: any) => r.remote_subscriber_id === '12').proposed_action).toBe('create_contact_later');
    expect(rows.find((r: any) => r.remote_subscriber_id === '13').status_conflict).toBe(true);
    expect(JSON.stringify(rows)).not.toContain('a@example.com');
  });
});
