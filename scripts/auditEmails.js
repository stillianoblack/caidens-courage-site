const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'email-delivery-audit.json');
const MD_PATH = path.join(REPORTS_DIR, 'email-delivery-audit.md');

function emptyReport(error) {
  return {
    generatedAt: new Date().toISOString(),
    configured: false,
    error,
    summary: {
      welcomeEmailsSent: 0,
      notificationEmailsSent: 0,
      failedEmails: 0,
      skippedEmails: 0,
      usersWithNotificationsEnabledButNoEmailsSent: 0,
    },
    failed: [],
    skipped: [],
  };
}

function writeReports(report) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);

  const summary = report.summary || {};
  const lines = [
    '# Email Delivery Audit',
    '',
    `Generated: ${report.generatedAt || new Date().toISOString()}`,
    '',
    `Configured: ${report.configured ? 'yes' : 'no'}`,
    report.error ? `Error: ${report.error}` : '',
    '',
    '## Summary',
    '',
    `- Welcome emails sent: ${summary.welcomeEmailsSent || 0}`,
    `- Notification emails sent: ${summary.notificationEmailsSent || 0}`,
    `- Failed emails: ${summary.failedEmails || 0}`,
    `- Skipped emails: ${summary.skippedEmails || 0}`,
    `- Users with notifications enabled but no emails sent: ${
      summary.usersWithNotificationsEnabledButNoEmailsSent || 0
    }`,
    '',
  ].filter(Boolean);

  fs.writeFileSync(MD_PATH, `${lines.join('\n')}\n`);
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) {
    writeReports(
      emptyReport('Supabase env missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'),
    );
    return;
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from('email_delivery_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    writeReports(emptyReport(error.message));
    return;
  }

  const rows = data || [];
  writeReports({
    generatedAt: new Date().toISOString(),
    configured: true,
    summary: {
      welcomeEmailsSent: rows.filter(
        (row) => row.email_type === 'welcome' && row.status === 'sent',
      ).length,
      notificationEmailsSent: rows.filter(
        (row) => row.email_type !== 'welcome' && row.status === 'sent',
      ).length,
      failedEmails: rows.filter((row) => row.status === 'failed').length,
      skippedEmails: rows.filter((row) => row.status === 'skipped').length,
      usersWithNotificationsEnabledButNoEmailsSent: 0,
    },
    failed: rows.filter((row) => row.status === 'failed'),
    skipped: rows.filter((row) => row.status === 'skipped'),
  });
}

main().catch((error) => {
  writeReports(emptyReport(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
