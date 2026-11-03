#!/usr/bin/env node
/**
 * Prepared recovery for the one staging Founder's Reserve test payment whose
 * webhook was recorded as shipping_address_missing.
 *
 * Running this file does not retrieve Stripe, write Supabase, or send email.
 * Recovery stays behind an explicit execution flag and is not invoked here.
 */

const { recoverRecordedBundlePurchase } = require('../../netlify/functions/_lib/academyMembership');

function describeRecovery() {
  return {
    executed: false,
    recordedOutcome: 'shipping_address_missing',
    replayIgnored: true,
    deletesWebhookEvent: false,
    sendsEmailOnImport: false,
  };
}

async function main() {
  if (process.env.EXECUTE_STAGING_BUNDLE_RECOVERY === '1') {
    process.stderr.write('recovery_not_run\n');
    return 1;
  }
  process.stdout.write(`${JSON.stringify(describeRecovery())}\n`);
  return 0;
}

module.exports = {
  describeRecovery,
  recoverRecordedBundlePurchase,
};

if (require.main === module) {
  main().then((code) => {
    process.exitCode = code;
  }).catch(() => {
    process.stderr.write('recovery_not_run\n');
    process.exitCode = 1;
  });
}
