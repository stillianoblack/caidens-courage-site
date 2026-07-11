const { classification, readOnly } = require('./_lib/crmHandlers');
exports.handler = readOnly(classification);
