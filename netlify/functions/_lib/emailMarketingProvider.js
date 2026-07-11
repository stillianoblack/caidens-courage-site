class ProviderError extends Error {
  constructor(message, code = 'provider_error', retryable = false) { super(message); this.code = code; this.retryable = retryable; }
}

class MockEmailMarketingProvider {
  constructor() { this.contacts = new Map(); this.calls = []; }
  async verifyConfiguration() { return { ok: true, mode: 'mock' }; }
  listCapabilities() { return { contactRead: true, contactWrite: true, segments: true, sequences: true, broadcasts: true, broadcastStats: true, suppression: true, reconciliation: true }; }
  async upsertContact(input) { this.calls.push(['upsertContact', input]); this.contacts.set(input.contactId, { ...input, segments: [] }); return { externalContactId: `mock-${input.contactId}` }; }
  async updateContactFields(input) { this.calls.push(['updateContactFields', input]); return { ok: true }; }
  async addContactToSegment(input) { this.calls.push(['addContactToSegment', input]); return { ok: true }; }
  async removeContactFromSegment(input) { this.calls.push(['removeContactFromSegment', input]); return { ok: true }; }
  async listContactSegments(input) { this.calls.push(['listContactSegments', input]); return []; }
  async getContactStatus(input) { this.calls.push(['getContactStatus', input]); return { status: 'unknown' }; }
  async suppressContact(input) { this.calls.push(['suppressContact', input]); return { ok: true }; }
  async listSubscribers() { return { items: [], nextCursor: null }; }
  async listTags() { return { items: [], nextCursor: null }; }
  async listSequences() { return { items: [], nextCursor: null }; }
  async listBroadcasts() { return { items: [], nextCursor: null }; }
  async getBroadcastStats() { return { metrics: {} }; }
  async reconcileContact(input) { this.calls.push(['reconcileContact', input]); return { status: 'matched' }; }
}

module.exports = { MockEmailMarketingProvider, ProviderError };
