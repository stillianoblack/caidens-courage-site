#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const REPORTS_DIR = path.join(ROOT, 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'portal-identity-audit.json');
const MD_PATH = path.join(REPORTS_DIR, 'portal-identity-audit.md');

const LEGACY_UNSAFE_KEYS = [
  'parentClaimEmail',
  'parentClaimPhone',
  'parentClaimLastName',
  'parentClaimConfirmed',
  'activeChildParticipantId',
  'activeChildNickname',
  'currentFamilyEmail',
  'lastPortalEmail',
  'rememberedProgram',
];

const STORAGE_KEY_PATTERN =
  /(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*['"`]([^'"`]+)['"`]/g;

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

    for (const key of LEGACY_UNSAFE_KEYS) {
      if (!content.includes(key)) continue;
      const isClearOnly =
        content.includes(`removeItem('${key}')`) ||
        content.includes(`removeItem("${key}")`) ||
        content.includes(`'${key}'`) && /clear|reject|legacy|purge/i.test(content);
      if (rel.includes('portalSessionIsolation') || rel.includes('parentClaimContext.ts')) {
        continue;
      }
      if (key === 'activeChildParticipantId' && rel.includes('activeChildParticipant.ts')) {
        if (content.includes('Legacy unscoped key retired')) continue;
      }
      findings.push({
        severity: isClearOnly ? 'info' : 'warning',
        kind: 'legacy_identity_key_reference',
        file: rel,
        detail: `References legacy identity key "${key}".`,
      });
    }

    if (
      rel.includes('usePortalUnlock.ts') &&
      content.includes("role === 'family'") &&
      !content.includes('clearParentClaimContext') &&
      content.includes('verifyStudentPinLogin')
    ) {
      findings.push({
        severity: 'high',
        kind: 'student_pin_login_missing_parent_clear',
        file: rel,
        detail: 'Student PIN login must clear parent claim context before kid shell launch.',
      });
    }

    if (
      rel.includes('usePortalUnlock.ts') &&
      content.includes('resolveFamilyPortalOverviewPath') === false &&
      content.includes('claimParentFamilyPortal')
    ) {
      findings.push({
        severity: 'high',
        kind: 'parent_login_routes_to_kid_shell',
        file: rel,
        detail: 'Parent email login must route to Family Portal overview, not kid shell.',
      });
    }

    if (
      rel.includes('familyParentClaimState.ts') &&
      !content.includes('isParentConnected')
    ) {
      findings.push({
        severity: 'high',
        kind: 'parent_connected_without_email_check',
        file: rel,
        detail: 'Parent connected status must require stored parent email/profile.',
      });
    }

    if (
      rel.includes('rememberedProgramAccess.ts') &&
      content.includes('writeRememberedProgramAccess') &&
      !content.includes('rememberDevice')
    ) {
      findings.push({
        severity: 'warning',
        kind: 'remembered_program_always_written',
        file: rel,
        detail: 'Remembered program should only persist when remember-device is checked.',
      });
    }
  }

  return findings;
}

function buildReport(files) {
  const findings = scanFindings(files);
  const highFindings = findings.filter((row) => row.severity === 'high');

  const usePortalUnlock = readSrc('hooks/usePortalUnlock.ts');
  const familyParentClaimState = readSrc('lib/familyParentClaimState.ts');
  const rememberedProgramAccess = readSrc('lib/rememberedProgramAccess.ts');
  const portalIdentityReset = readSrc('lib/portalIdentityReset.ts');
  const activeChildParticipant = readSrc('config/activeChildParticipant.ts');

  const guardrails = {
    parentLoginRoutesToOverview:
      usePortalUnlock.includes('resolveFamilyPortalOverviewPath') &&
      usePortalUnlock.includes('parent-claim-family'),
    studentPinClearsParentClaim:
      usePortalUnlock.includes('clearParentClaimContext') &&
      usePortalUnlock.includes('verifyStudentPinLogin'),
    facilitatorRoutesToRoster:
      usePortalUnlock.includes('facilitatorReturnSessionPath') &&
      usePortalUnlock.includes('facilitator-email-verified'),
    parentConnectedRequiresEmail: familyParentClaimState.includes('isParentConnected'),
    switchProgramClearsIdentity:
      rememberedProgramAccess.includes('clearAllPortalAuthState') &&
      portalIdentityReset.includes('clearAllPortalAuthState'),
    legacyActiveChildWriteRetired: activeChildParticipant.includes('Legacy unscoped key retired'),
    rememberDeviceGatedProgramAccess:
      usePortalUnlock.includes('if (input.rememberDevice)') &&
      usePortalUnlock.includes('writeRememberedProgramAccess'),
  };

  const passed = highFindings.length === 0 && Object.values(guardrails).every(Boolean);

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
    '# Portal Identity Audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `**Status:** ${report.passed ? 'PASS' : 'FAIL'}`,
    '',
    '## Summary',
    '',
    `- Source files scanned: ${report.summary.sourceFilesScanned}`,
    `- Findings: ${report.summary.findings}`,
    `- High severity findings: ${report.summary.highSeverityFindings}`,
    '',
    '## Guardrails',
    '',
    `- Parent login routes to Family overview: ${report.guardrails.parentLoginRoutesToOverview ? 'yes' : 'no'}`,
    `- Student PIN login clears parent claim: ${report.guardrails.studentPinClearsParentClaim ? 'yes' : 'no'}`,
    `- Facilitator login routes to roster: ${report.guardrails.facilitatorRoutesToRoster ? 'yes' : 'no'}`,
    `- Parent connected requires email: ${report.guardrails.parentConnectedRequiresEmail ? 'yes' : 'no'}`,
    `- Switch program clears identity: ${report.guardrails.switchProgramClearsIdentity ? 'yes' : 'no'}`,
    `- Legacy active child write retired: ${report.guardrails.legacyActiveChildWriteRetired ? 'yes' : 'no'}`,
    `- Remember-device gates program access: ${report.guardrails.rememberDeviceGatedProgramAccess ? 'yes' : 'no'}`,
    '',
  ];

  if (report.findings.length) {
    lines.push('## Findings', '');
    for (const finding of report.findings) {
      lines.push(`- **${finding.severity}** \`${finding.kind}\` — ${finding.file}: ${finding.detail}`);
    }
    lines.push('');
  }

  fs.writeFileSync(MD_PATH, lines.join('\n'));
}

function main() {
  const files = walk(SRC_DIR);
  const report = buildReport(files);
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
  writeMarkdown(report);
  console.log(`Portal identity audit: ${report.passed ? 'PASS' : 'FAIL'}`);
  console.log(`Report: ${path.relative(ROOT, MD_PATH)}`);
  if (!report.passed) process.exit(1);
}

main();
