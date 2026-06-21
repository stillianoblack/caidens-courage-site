#!/usr/bin/env node

function readEnv(name) {
  return String(process.env[name] || '').trim();
}

function kitEnabled() {
  const key = readEnv('KIT_API_KEY');
  if (process.env.KIT_ENABLED === 'false') return false;
  return Boolean(key);
}

function resendEnabled() {
  return Boolean(readEnv('RESEND_API_KEY'));
}

const isCi = process.env.CI === 'true';
const nodeEnv = process.env.NODE_ENV || 'development';

const report = {
  generatedAt: new Date().toISOString(),
  nodeEnv,
  resend: {
    RESEND_API_KEY: resendEnabled(),
    RESEND_FROM_EMAIL: readEnv('RESEND_FROM_EMAIL') || "Caiden's Courage <hello@caidenscourage.com>",
    welcomeEmailWillSend: resendEnabled(),
  },
  kit: {
    KIT_API_KEY: Boolean(readEnv('KIT_API_KEY')),
    KIT_ENABLED: kitEnabled(),
    KIT_API_BASE_URL: readEnv('KIT_API_BASE_URL') || 'https://api.kit.com',
    tagEventsWillSend: kitEnabled(),
  },
  localDev: {
    welcomeEmailLikelySkipped: !resendEnabled(),
    kitEventsLikelySkipped: !kitEnabled(),
    note: 'npm start does not run Netlify functions unless using netlify dev.',
  },
  production: {
    welcomeEmailWillSend: resendEnabled(),
    kitTagEventsWillSend: kitEnabled(),
  },
};

console.log('# Email configuration check');
console.log('');
console.log('## Resend (welcome / invite emails)');
console.log(`- RESEND_API_KEY configured: ${report.resend.RESEND_API_KEY ? 'yes' : 'no'}`);
console.log(`- RESEND_FROM_EMAIL: ${report.resend.RESEND_FROM_EMAIL}`);
console.log(`- Welcome emails will send: ${report.resend.welcomeEmailWillSend ? 'yes' : 'no (skipped)'}`);
console.log('');
console.log('## Kit (CRM tags / parent signup events)');
console.log(`- KIT_API_KEY configured: ${report.kit.KIT_API_KEY ? 'yes' : 'no'}`);
console.log(`- KIT_ENABLED effective: ${report.kit.KIT_ENABLED ? 'yes' : 'no'}`);
console.log(`- KIT_API_BASE_URL: ${report.kit.KIT_API_BASE_URL}`);
console.log(`- Kit tag events will send: ${report.kit.tagEventsWillSend ? 'yes' : 'no (skipped)'}`);
console.log('');
console.log('## Local development');
console.log(`- Welcome email likely skipped locally: ${report.localDev.welcomeEmailLikelySkipped ? 'yes' : 'no'}`);
console.log(`- Kit events likely skipped locally: ${report.localDev.kitEventsLikelySkipped ? 'yes' : 'no'}`);
console.log(`- Note: ${report.localDev.note}`);
console.log('');
console.log('## Production expectation');
console.log(`- Welcome emails: ${report.production.welcomeEmailWillSend ? 'will send when Netlify function runs' : 'will fail until RESEND_API_KEY is set'}`);
console.log(`- Kit tag events: ${report.production.kitTagEventsWillSend ? 'will send when KIT_ENABLED=true and key is set' : 'skipped until Kit is configured'}`);

const missing = [];
if (!report.resend.RESEND_API_KEY) missing.push('RESEND_API_KEY');
if (!report.kit.KIT_API_KEY) missing.push('KIT_API_KEY');
if (!report.kit.KIT_ENABLED && report.kit.KIT_API_KEY) {
  missing.push('KIT_ENABLED=true (optional — key alone enables Kit in server code)');
}

if (missing.length && isCi) {
  console.log('');
  console.log(`Missing optional env vars: ${missing.join(', ')}`);
}

process.exit(0);
