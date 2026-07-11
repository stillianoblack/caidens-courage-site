const { contact, readOnly } = require('./_lib/crmHandlers');
exports.handler = readOnly(contact);
