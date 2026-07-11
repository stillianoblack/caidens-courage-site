const { organizations, readOnly } = require('./_lib/crmHandlers');
exports.handler = readOnly(organizations);
