const { organization, readOnly } = require('./_lib/crmHandlers');
exports.handler = readOnly(organization);
