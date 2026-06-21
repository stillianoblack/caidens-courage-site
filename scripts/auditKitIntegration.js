const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'kit-integration-audit.json');
const MD_PATH = path.join(REPORTS_DIR, 'kit-integration-audit.md');

function emptyReport(error) {
  return {
    generatedAt: new Date().toISOString(),
    kitApiKeyConfigured: Boolean(process.env.KIT_API_KEY?.trim()),
    kitEnabled:
      process.env.KIT_ENABLED !== 'false' && Boolean(process.env.KIT_API_KEY?.trim()),
    kitApiBaseUrl: process.env.KIT_API_BASE_URL || 'https://api.kit.com',
    error,
    summary: {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
    },
    latestEvents: [],
    missingParentEmailEvents: [],
  };
}

function writeReports(report) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);

  const summary = report.summary || {};
  const lines = [
    '# Kit Integration Audit',
    '',
    `Generated: ${report.generatedAt || new Date().toISOString()}`,
    '',
    '## Configuration',
    '',
    `- KIT_API_KEY configured: ${report.kitApiKeyConfigured ? 'yes' : 'no'}`,
    `- KIT_ENABLED effective: ${report.kitEnabled ? 'yes' : 'no'}`,
    `- KIT_API_BASE_URL: ${report.kitApiBaseUrl || 'https://api.kit.com'}`,
    report.error ? `- Error: ${report.error}` : '',
    '',
    '## Summary',
    '',
    `- Total Kit integration logs: ${summary.total || 0}`,
    `- Successes: ${summary.success || 0}`,
    `- Failures: ${summary.failed || 0}`,
    `- Skipped: ${summary.skipped || 0}`,
    '',
    '## Missing parent email (week/certificate events)',
    '',
  ].filter(Boolean);

  const missing = report.missingParentEmailEvents || [];
  if (!missing.length) {
    lines.push('- None recorded.');
  } else {
    for (const row of missing) {
      lines.push(
        `- ${row.created_at} · ${row.event_name} · participant ${row.metadata?.participant_id ?? '—'}`,
      );
    }
  }

  lines.push('', '## Latest 20 Kit events', '');
  const latest = report.latestEvents || [];
  if (!latest.length) {
    lines.push('- No Kit integration logs yet.');
  } else {
    for (const row of latest) {
      lines.push(
        `- ${row.created_at} · ${row.status} · ${row.event_name} · ${row.email || '—'} · ${row.tag_name || '—'}${
          row.error_message ? ` · ${row.error_message}` : ''
        }`,
      );
    }
  }

  fs.writeFileSync(MD_PATH, `${lines.join('\n')}\n`);
}

async function fetchKitIntegrationLogs(url, key) {
  const endpoint = `${url.replace(/\/+$/, '')}/rest/v1/integration_logs?provider=eq.kit&order=created_at.desc`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase query failed (${response.status})`);
  }

  return response.json();
}

async function main() {
  const kitApiKeyConfigured = Boolean(process.env.KIT_API_KEY?.trim());
  const kitEnabled = process.env.KIT_ENABLED !== 'false' && kitApiKeyConfigured;

  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!url || !key) {
    writeReports(emptyReport('Supabase env missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'));
    console.log('Kit integration audit written (Supabase missing).');
    return;
  }

  try {
    const rows = await fetchKitIntegrationLogs(url, key);
    const summary = {
      total: rows.length,
      success: rows.filter((row) => row.status === 'success').length,
      failed: rows.filter((row) => row.status === 'failed').length,
      skipped: rows.filter((row) => row.status === 'skipped').length,
    };

    const missingParentEmailEvents = rows.filter(
      (row) =>
        row.status === 'skipped' &&
        (row.error_message === 'no_parent_email' ||
          row.metadata?.skip_reason === 'no_parent_email') &&
        /^completed_week_|^month_1_graduate$/.test(String(row.event_name || '')),
    );

    writeReports({
      generatedAt: new Date().toISOString(),
      kitApiKeyConfigured,
      kitEnabled,
      kitApiBaseUrl: process.env.KIT_API_BASE_URL || 'https://api.kit.com',
      summary,
      latestEvents: rows.slice(0, 20),
      missingParentEmailEvents: missingParentEmailEvents.slice(0, 50),
    });

    console.log('Kit integration audit complete.');
    console.log(`JSON: ${JSON_PATH}`);
    console.log(`Markdown: ${MD_PATH}`);
  } catch (queryError) {
    writeReports({
      ...emptyReport(queryError instanceof Error ? queryError.message : String(queryError)),
      kitApiKeyConfigured,
      kitEnabled,
    });
    console.log('Kit integration audit written (query failed).');
  }
}

main().catch((error) => {
  writeReports(emptyReport(error instanceof Error ? error.message : String(error)));
  console.error(error);
  process.exitCode = 1;
});
