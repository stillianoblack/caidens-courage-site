const { assertStagingDatabaseSafety } = require('./lib/stagingSafetyGate');

const operation = process.argv[2] || '';
const supportedOperations = new Set([
  'baseline',
  'seed',
  'feature-migration',
  'signup-integration',
  'cleanup',
  'identity-audit',
  'crm-verification',
]);

if (!supportedOperations.has(operation)) {
  console.error(`Operation must be one of: ${Array.from(supportedOperations).join(', ')}.`);
  process.exitCode = 1;
} else {
  assertStagingDatabaseSafety({
    requireLegacyBaseline: operation !== 'baseline',
    requireCrmSchema: operation === 'crm-verification',
  })
    .then(() => {
      console.log(`Staging safety gate passed for ${operation}. No secrets were printed.`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
