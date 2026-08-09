const { json } = require('./_lib/crmAuth');
const { requirePortalOwnership } = require('./_lib/portalOwnershipAuth');

exports.handler = async (event) => {
  const required = await requirePortalOwnership(event);
  if (required.response) return required.response;
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed.' }, required.context.correlationId);
  }
  const { correlationId, memberships, participantAccess } = required.context;
  return json(200, {
    memberships: memberships.map((row) => ({
      programId: row.program_id,
      role: row.portal_role,
      compatibilityMode: row.compatibility_mode,
    })),
    participantAccess: participantAccess.map((row) => ({
      participantId: row.participant_id,
      scope: row.access_scope,
    })),
  }, correlationId);
};
