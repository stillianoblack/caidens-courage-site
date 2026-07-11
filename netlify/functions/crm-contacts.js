const { contacts, readOnly } = require('./_lib/crmHandlers');
exports.handler = readOnly(contacts);
