const { overview, readOnly } = require('./_lib/crmHandlers');
exports.handler = readOnly(overview);
