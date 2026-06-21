#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const REPORTS_DIR = path.join(ROOT, 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'portal-auth-audit.json');
const MD_PATH = path.join(REPORTS_DIR, 'portal-auth-audit.md');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue;
      walk(full, files);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function relative(file) {
  return path.relative(ROOT, file);
}

function readSrc(relPath) {
  return fs.readFileSync(path.join(SRC_DIR, relPath), 'utf8');
}

function scanFindings(files) {
  const findings = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = relative(file);

    if (
      rel.includes('usePortalUnlock.ts') &&
      content.includes("role === 'facilitator'") &&
      !content.includes('verifyFacilitatorProgramEmail')
    ) {
      findings.push({
        severity: 'high',
        kind: 'facilitator_unlock_without_email_verify',
        file: rel,
        detail: 'Facilitator portal unlock must verify email against program.',
      });
    }

    if (
      /applyProgramPortalUnlock\([^)]*'facilitator'/.test(content) &&
      !content.includes('verifyFacilitatorProgramEmail') &&
      !rel.includes('portalContext.ts') &&
      !rel.includes('PortalWelcomeBackCard') &&
      !rel.includes('rememberedDeviceResume')
    ) {
      findings.push({
        severity: 'warning',
        kind: 'facilitator_apply_unlock_without_local_verify',
        file: rel,
        detail: 'applyProgramPortalUnlock(facilitator) — confirm email was verified upstream.',
      });
    }

    if (
      content.includes('hasBlueRibbonUnlock()') &&
      content.includes('BLUE_RIBBON_CAMP_PROGRAM_CODE') &&
      !content.includes('isLegacyDemoUnlockAllowed') &&
      !rel.includes('blueRibbonPilotProgram.ts')
    ) {
      findings.push({
        severity: 'high',
        kind: 'blueribbon_fallback_without_dev_flag',
        file: rel,
        detail: 'Blue Ribbon program fallback must be gated by REACT_APP_DEV_AUTH_BYPASS.',
      });
    }

    if (
      content.includes('isLegacyDemoAccessCode') &&
      content.includes('writeBlueRibbonUnlock') &&
      !content.includes('isLegacyDemoUnlockAllowed') &&
      !rel.includes('portalAuthConfig.ts')
    ) {
      findings.push({
        severity: 'high',
        kind: 'legacy_demo_unlock_without_dev_flag',
        file: rel,
        detail: 'Legacy demo unlock must require REACT_APP_DEV_AUTH_BYPASS=true.',
      });
    }

    if (
      content.includes('readLastPilotProgramForRole') &&
      content.includes('applyProgramPortalUnlock') &&
      rel.includes('PortalWelcomeBackCard')
    ) {
      findings.push({
        severity: 'info',
        kind: 'welcome_back_restore',
        file: rel,
        detail: 'Welcome-back restore requires explicit user action (Continue button).',
      });
    }

    if (
      content.includes('detectReturnSessionFacilitatorEmailMatch') &&
      !content.includes('resolvePortalProgramScope') &&
      rel.includes('kidPlayReturnSessionVerify.ts')
    ) {
      findings.push({
        severity: 'high',
        kind: 'email_only_facilitator_restore',
        file: rel,
        detail: 'Facilitator return-session match must require program scope.',
      });
    }
  }

  return findings;
}

function buildReport() {
  const files = walk(SRC_DIR);
  const findings = scanFindings(files);
  const highFindings = findings.filter((row) => row.severity === 'high');

  const guardrails = {
    facilitatorEmailVerificationModule: fs.existsSync(
      path.join(SRC_DIR, 'lib/portalFacilitatorAuth.ts'),
    ),
    devBypassFlagModule: fs.existsSync(path.join(SRC_DIR, 'lib/portalAuthConfig.ts')),
    switchProgramClearsAuth:
      readSrc('lib/rememberedProgramAccess.ts').includes('clearAllPortalAuthState') &&
      readSrc('lib/portalIdentityReset.ts').includes('clearLastPilotProgram'),
    usePortalUnlockVerifiesFacilitatorEmail: readSrc('hooks/usePortalUnlock.ts').includes(
      'verifyFacilitatorProgramEmail',
    ),
    legacyDemoGated: readSrc('hooks/usePortalUnlock.ts').includes('isLegacyDemoUnlockAllowed'),
    blueRibbonCrossGrantGated: readSrc('config/blueRibbonPortalAccess.ts').includes(
      'isLegacyDemoUnlockAllowed',
    ),
  };

  const passed = highFindings.length === 0 && guardrails.usePortalUnlockVerifiesFacilitatorEmail;

  return {
    generatedAt: new Date().toISOString(),
    passed,
    summary: {
      sourceFilesScanned: files.length,
      findings: findings.length,
      highSeverityFindings: highFindings.length,
    },
    guardrails,
    findings,
  };
}

function writeMarkdown(report) {
  const lines = [
    '# Portal Auth Audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `**Status:** ${report.passed ? 'PASS' : 'FAIL'}`,
    '',
    '## Guardrails',
    '',
    `- Facilitator email verification module: ${report.guardrails.facilitatorEmailVerificationModule ? 'yes' : 'no'}`,
    `- DEV bypass flag module: ${report.guardrails.devBypassFlagModule ? 'yes' : 'no'}`,
    `- switchRememberedProgram clears full auth: ${report.guardrails.switchProgramClearsAuth ? 'yes' : 'no'}`,
    `- usePortalUnlock verifies facilitator email: ${report.guardrails.usePortalUnlockVerifiesFacilitatorEmail ? 'yes' : 'no'}`,
    `- Legacy demo unlock gated: ${report.guardrails.legacyDemoGated ? 'yes' : 'no'}`,
    `- Blue Ribbon cross-grant gated: ${report.guardrails.blueRibbonCrossGrantGated ? 'yes' : 'no'}`,
    '',
    '## Findings',
    '',
  ];

  if (!report.findings.length) {
    lines.push('- None.');
  } else {
    for (const row of report.findings) {
      lines.push(`- **${row.severity}** \`${row.kind}\` — ${row.file}: ${row.detail}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function main() {
  const report = buildReport();
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(MD_PATH, writeMarkdown(report));

  console.log(`Portal auth audit: ${report.passed ? 'PASS' : 'FAIL'}`);
  console.log(`Report: ${path.relative(ROOT, MD_PATH)}`);

  if (!report.passed) {
    for (const row of report.findings.filter((f) => f.severity === 'high')) {
      console.error(`HIGH: ${row.file} — ${row.detail}`);
    }
    process.exit(1);
  }
}

main();
