const {
  CUSTOMER_MESSAGES,
  redeemRecoveryToken,
  resolveDigitalDownload,
  resolveDownloadTtl,
  jsonResponse,
  createSupabaseBookstoreStore,
  getServiceClient,
} = require('./_lib/bookstoreDelivery');

exports.handler = async function bookstoreDigitalAccess(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!token || body.sessionId) {
    return jsonResponse(403, { error: 'unauthorized', message: CUSTOMER_MESSAGES.unauthorized });
  }

  const client = getServiceClient();
  if (!client) return jsonResponse(503, { error: 'delivery_not_configured' });
  const store = createSupabaseBookstoreStore(client);

  try {
    const preview = await redeemRecoveryToken({ token, store, consume: false });
    if (!preview.ok) {
      return jsonResponse(403, { error: 'unauthorized', message: CUSTOMER_MESSAGES.unauthorized });
    }
    const matches = await store.listEntitlementsByEmail(preview.email);
    const entitlement = matches.find((match) => match.status === 'active') || null;
    const file = entitlement ? await store.getFile(entitlement.productKey) : null;
    if (!file?.objectPath) {
      return jsonResponse(409, {
        error: 'missing_file',
        message: CUSTOMER_MESSAGES.missing_file,
      });
    }
    const redeemed = await redeemRecoveryToken({ token, store, consume: true });
    if (!redeemed.ok) {
      return jsonResponse(403, { error: 'unauthorized', message: CUSTOMER_MESSAGES.unauthorized });
    }
    const decision = await resolveDigitalDownload({
      entitlement,
      file,
      email: redeemed.email,
      tokenAuthenticated: true,
      signer: async ({ bucket, objectPath, ttlSeconds }) => {
        const { data, error } = await client.storage.from(bucket).createSignedUrl(objectPath, ttlSeconds);
        if (error || !data?.signedUrl) throw error || new Error('signed_url_failed');
        return data.signedUrl;
      },
      ttlSeconds: resolveDownloadTtl(process.env.BOOKSTORE_DOWNLOAD_URL_TTL_SECONDS),
    });
    return jsonResponse(decision.statusCode, decision.body);
  } catch (error) {
    console.error('[bookstore] Digital access failed.');
    return jsonResponse(500, { error: 'download_failed', message: 'The download could not be prepared.' });
  }
};
