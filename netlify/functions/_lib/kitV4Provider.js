const { ProviderError } = require('./emailMarketingProvider');

const BASE_URL = 'https://api.kit.com';
const CAPABILITIES = Object.freeze({
  apiVersion: 'v4', authentication: 'X-Kit-Api-Key', cursorPagination: true,
  subscribersRead: true, subscriberUpsert: true, subscriberUpdate: true, subscriberStateRead: true,
  subscriberStateUpdateViaUpsert: false, unsubscribe: true, tagsRead: true, tagAdd: true, tagRemove: true,
  sequencesRead: true, sequenceAdd: true, sequenceRemove: false, formsRead: true,
  broadcastsRead: true, broadcastStats: true, broadcastDeliveredMetric: false,
  bounceAggregateMetric: false, complaintAggregateMetric: false,
  webhookCryptographicVerification: false, idempotencyHeader: false,
});

function cleanError(payload, status) {
  const message = Array.isArray(payload?.errors) ? payload.errors.join(', ') : payload?.message || payload?.error || `Kit API ${status}`;
  return String(message).slice(0, 500);
}

class KitV4Provider {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.KIT_API_KEY;
    this.baseUrl = (options.baseUrl || process.env.KIT_API_BASE_URL || BASE_URL)
      .replace(/\/+$/, '')
      .replace(/\/v4$/i, '');
    this.fetch = options.fetch || global.fetch;
  }
  listCapabilities() { return { ...CAPABILITIES }; }
  async verifyConfiguration() {
    if (!this.apiKey || !this.fetch) return { ok: false, error: 'Kit v4 server configuration missing.' };
    return { ok: true, apiVersion: 'v4', authentication: 'api_key' };
  }
  async request(path, options = {}) {
    if (!this.apiKey) throw new ProviderError('Kit v4 server configuration missing.', 'not_configured', false);
    const response = await this.fetch(`${this.baseUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': this.apiKey, ...(options.headers || {}) } });
    const text = await response.text(); let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
    if (!response.ok) throw new ProviderError(cleanError(payload, response.status), `kit_${response.status}`, response.status === 429 || response.status >= 500);
    return payload;
  }
  async page(path, key, cursor) {
    const join = path.includes('?') ? '&' : '?';
    const payload = await this.request(`${path}${cursor ? `${join}after=${encodeURIComponent(cursor)}` : ''}`);
    return { items: payload?.[key] || [], nextCursor: payload?.pagination?.has_next_page ? payload.pagination.end_cursor : null, totalCount: payload?.pagination?.total_count ?? null };
  }
  async listSubscribers(input = {}) { return this.page(`/v4/subscribers?per_page=${Math.min(1000, input.limit || 100)}&status=${encodeURIComponent(input.status || 'all')}`, 'subscribers', input.cursor); }
  async getContactStatus(input) { const payload = await this.request(`/v4/subscribers/${encodeURIComponent(input.externalContactId)}`); return { externalContactId: String(payload.subscriber.id), status: payload.subscriber.state, email: payload.subscriber.email_address }; }
  async upsertContact(input) {
    if (!input.explicitConfirmedConsent) throw new ProviderError('Explicit confirmed consent required.', 'consent_required', false);
    const fields = {}; if (input.lastName) fields.last_name = input.lastName;
    const payload = await this.request('/v4/subscribers', { method: 'POST', body: JSON.stringify({ email_address: input.email, first_name: input.firstName || null, state: 'active', fields }) });
    return { externalContactId: String(payload.subscriber.id), status: payload.subscriber.state };
  }
  async updateContactFields(input) {
    const fields = {}; if (input.lastName) fields.last_name = input.lastName;
    const payload = await this.request(`/v4/subscribers/${encodeURIComponent(input.externalContactId)}`, { method: 'PUT', body: JSON.stringify({ first_name: input.firstName || null, email_address: input.email, fields }) });
    return { externalContactId: String(payload.subscriber.id), status: payload.subscriber.state };
  }
  async listTags(input = {}) { return this.page('/v4/tags?per_page=1000', 'tags', input.cursor); }
  async listContactSegments(input = {}) { return this.page(`/v4/subscribers/${encodeURIComponent(input.externalContactId)}/tags?per_page=1000`, 'tags', input.cursor); }
  async addContactToSegment(input) { const payload = await this.request(`/v4/tags/${encodeURIComponent(input.externalSegmentId)}/subscribers/${encodeURIComponent(input.externalContactId)}`, { method: 'POST', body: '{}' }); return { ok: true, externalContactId: String(payload?.subscriber?.id || input.externalContactId) }; }
  async removeContactFromSegment(input) { await this.request(`/v4/tags/${encodeURIComponent(input.externalSegmentId)}/subscribers/${encodeURIComponent(input.externalContactId)}`, { method: 'DELETE' }); return { ok: true }; }
  async listSequences(input = {}) { return this.page('/v4/sequences?per_page=1000', 'sequences', input.cursor); }
  async addContactToSequence(input) { const payload = await this.request(`/v4/sequences/${encodeURIComponent(input.externalSequenceId)}/subscribers/${encodeURIComponent(input.externalContactId)}`, { method: 'POST', body: '{}' }); return { ok: true, externalContactId: String(payload.subscriber.id) }; }
  async removeContactFromSequence() { throw new ProviderError('Kit v4 sequence removal was not verified.', 'unsupported', false); }
  async listForms(input = {}) { return this.page('/v4/forms?per_page=1000', 'forms', input.cursor); }
  async listBroadcasts(input = {}) { return this.page('/v4/broadcasts?per_page=500', 'broadcasts', input.cursor); }
  async getBroadcastStats(input = {}) { if (input.externalBroadcastId) { const payload = await this.request(`/v4/broadcasts/${encodeURIComponent(input.externalBroadcastId)}/stats`); return { metrics: payload.broadcast.stats }; } return this.page('/v4/broadcasts/stats?per_page=500', 'broadcasts', input.cursor); }
  async suppressContact(input) { await this.request(`/v4/subscribers/${encodeURIComponent(input.externalContactId)}/unsubscribe`, { method: 'POST', body: '{}' }); return { ok: true, status: 'cancelled' }; }
  async reconcileContact(input) { const status = await this.getContactStatus(input); const segments = await this.listContactSegments(input); return { status, segments: segments.items, nextCursor: segments.nextCursor }; }
}

module.exports = { CAPABILITIES, KitV4Provider, cleanError };
