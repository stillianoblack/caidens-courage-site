#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const REPORTS_DIR = path.join(ROOT, 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'session-isolation-audit.json');
const MD_PATH = path.join(REPORTS_DIR, 'session-isolation-audit.md');

const SCOPED_KEYS = new Set([
  'cc-scoped-parent-claim',
  'cc-scoped-active-child',
  'cc-remembered-program-access',
  'cc-remembered-device-session',
  'cc-student-pin-session',
  'cc-facilitator-student-continuity',
  'activePilotProgram',
  'activeFamilyContext',
  'activeAccessCode',
  'activePortalRole',
  'lastPilotProgram:family',
  'lastPilotProgram:facilitator',
]);

const LEGACY_UNSAFE_KEYS = new Set([
  'parentClaimEmail',
  'parentClaimPhone',
  'parentClaimLastName',
  'parentClaimConfirmed',
  'activeChildParticipantId',
  'activeChildNickname',
]);

const STORAGE_KEY_PATTERN =
  /(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*['"`]([^'"`]+)['"`]/g;

const EXPORTED_KEY_PATTERN =
  /export const ([A-Z_0-9]+)\s*=\s*['"`]([^'"`]+)['"`]/g;

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

function scanStorageKeys(files) {
  const keyUsage = new Map();

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    STORAGE_KEY_PATTERN.lastIndex = 0;
    while ((match = STORAGE_KEY_PATTERN.exec(content)) !== null) {
      const key = match[1];
      if (!keyUsage.has(key)) keyUsage.set(key, []);
      keyUsage.get(key).push(relative(file));
    }

    EXPORTED_KEY_PATTERN.lastIndex = 0;
    while ((match = EXPORTED_KEY_PATTERN.exec(content)) !== null) {
      const key = match[2];
      if (!/KEY$/.test(match[1]) && !key.includes('-') && key.length < 4) continue;
      if (!keyUsage.has(key)) keyUsage.set(key, []);
      const ref = relative(file);
      if (!keyUsage.get(key).includes(ref)) keyUsage.get(key).push(ref);
    }
  }

  return keyUsage;
}

function scanRiskPatterns(files) {
  const findings = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const rel = relative(file);

    if (
      content.includes('readParentClaimContext') &&
      !content.includes('programCode') &&
      !rel.includes('parentClaimContext.ts') &&
      !rel.includes('hydrateExistingFamilyChildren')
    ) {
      findings.push({
        severity: 'warning',
        kind: 'parent_claim_read_without_program_hint',
        file: rel,
        detail: 'Uses readParentClaimContext — verify program scope is enforced at read time.',
      });
    }

    if (
      /familyLinks\[0\]/.test(content) &&
      rel.includes('family-portal')
    ) {
      findings.push({
        severity: 'high',
        kind: 'family_links_first_row',
        file: rel,
        detail: 'Uses familyLinks[0] which may show another family parent/child.',
      });
    }

    if (
      content.includes('writeParentClaimContext') &&
      !content.includes('programCode') &&
      !rel.includes('parentClaimContext.ts')
    ) {
      findings.push({
        severity: 'info',
        kind: 'parent_claim_write_may_resolve_scope',
        file: rel,
        detail: 'writeParentClaimContext without explicit programCode — relies on active program scope.',
      });
    }

    if (
      rel.includes('kidPlayReturnSessionVerify.ts') &&
      !content.includes('resolvePortalProgramScope')
    ) {
      findings.push({
        severity: 'high',
        kind: 'email_only_return_session',
        file: rel,
        detail: 'Return-session email match should require program scope.',
      });
    }

    if (
      content.includes('readActiveChildParticipantId') &&
      !content.includes('readActiveChildState') &&
      !content.includes('readScopedActiveChildRecord') &&
      !rel.includes('activeChildParticipant.ts') &&
      !rel.includes('activeChildNickname.ts')
    ) {
      findings.push({
        severity: 'warning',
        kind: 'unscoped_active_child_read',
        file: rel,
        detail: 'Reads activeChildParticipantId directly — prefer readActiveChildState().',
      });
    }
  }

  return findings;
}

function classifyKeys(keyUsage) {
  const scoped = [];
  const legacyUnsafe = [];
  const other = [];

  for (const [key, files] of keyUsage.entries()) {
    const entry = { key, files: [...new Set(files)].sort() };
    if (SCOPED_KEYS.has(key)) {
      scoped.push(entry);
    } else if (LEGACY_UNSAFE_KEYS.has(key)) {
      legacyUnsafe.push(entry);
    } else if (
      /email|parent|claim|child|participant|access|session|pin|role/i.test(key)
    ) {
      other.push(entry);
    }
  }

  scoped.sort((a, b) => a.key.localeCompare(b.key));
  legacyUnsafe.sort((a, b) => a.key.localeCompare(b.key));
  other.sort((a, b) => a.key.localeCompare(b.key));

  return { scoped, legacyUnsafe, other };
}

function buildReport() {
  const files = walk(SRC_DIR);
  const keyUsage = scanStorageKeys(files);
  const classified = classifyKeys(keyUsage);
  const findings = scanRiskPatterns(files);

  const highFindings = findings.filter((row) => row.severity === 'high');
  const passed = highFindings.length === 0;

  return {
    generatedAt: new Date().toISOString(),
    passed,
    summary: {
      sourceFilesScanned: files.length,
      storageKeysFound: keyUsage.size,
      scopedKeys: classified.scoped.length,
      legacyUnsafeKeys: classified.legacyUnsafe.length,
      identityRelatedKeys: classified.other.length,
      findings: findings.length,
      highSeverityFindings: highFindings.length,
    },
    scopedKeys: classified.scoped,
    legacyUnsafeKeys: classified.legacyUnsafe,
    identityRelatedKeys: classified.other,
    findings,
    guardrails: {
      programScopedParentClaim: classified.scoped.some((row) => row.key === 'cc-scoped-parent-claim'),
      programScopedActiveChild: classified.scoped.some((row) => row.key === 'cc-scoped-active-child'),
      switchProgramClearsIdentity:
        fs.readFileSync(path.join(SRC_DIR, 'lib/rememberedProgramAccess.ts'), 'utf8').includes('clearAllPortalAuthState') &&
        fs.readFileSync(path.join(SRC_DIR, 'lib/portalIdentityReset.ts'), 'utf8').includes('clearAllPortalAuthState'),
      signOutClearsIdentity:
        fs.readFileSync(path.join(SRC_DIR, 'config/portalContext.ts'), 'utf8').includes('clearAllPortalAuthState') &&
        fs.readFileSync(path.join(SRC_DIR, 'lib/portalIdentityReset.ts'), 'utf8').includes('clearAllPortalAuthState'),
    },
  };
}

function writeMarkdown(report) {
  const lines = [
    '# Session Isolation Audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `**Status:** ${report.passed ? 'PASS' : 'FAIL'}`,
    '',
    '## Summary',
    '',
    `- Source files scanned: ${report.summary.sourceFilesScanned}`,
    `- Storage keys found: ${report.summary.storageKeysFound}`,
    `- Scoped identity keys: ${report.summary.scopedKeys}`,
    `- Legacy unsafe keys still referenced: ${report.summary.legacyUnsafeKeys}`,
    `- High severity findings: ${report.summary.highSeverityFindings}`,
    '',
    '## Guardrails',
    '',
    `- Program-scoped parent claim key: ${report.guardrails.programScopedParentClaim ? 'yes' : 'no'}`,
    `- Program-scoped active child key: ${report.guardrails.programScopedActiveChild ? 'yes' : 'no'}`,
    `- switchRememberedProgram clears identity: ${report.guardrails.switchProgramClearsIdentity ? 'yes' : 'no'}`,
    `- signOutPortal clears identity: ${report.guardrails.signOutClearsIdentity ? 'yes' : 'no'}`,
    '',
    '## Scoped keys',
    '',
  ];

  if (!report.scopedKeys.length) {
    lines.push('- None found.');
  } else {
    for (const row of report.scopedKeys) {
      lines.push(`- \`${row.key}\` (${row.files.length} files)`);
    }
  }

  lines.push('', '## Legacy unsafe keys (must not restore without program scope)', '');

  if (!report.legacyUnsafeKeys.length) {
    lines.push('- None referenced.');
  } else {
    for (const row of report.legacyUnsafeKeys) {
      lines.push(`- \`${row.key}\` — ${row.files.join(', ')}`);
    }
  }

  lines.push('', '## Findings', '');

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

  console.log(`Session isolation audit: ${report.passed ? 'PASS' : 'FAIL'}`);
  console.log(`Report: ${relative(MD_PATH)}`);

  if (!report.passed) {
    for (const row of report.findings.filter((f) => f.severity === 'high')) {
      console.error(`HIGH: ${row.file} — ${row.detail}`);
    }
    process.exit(1);
  }
}

main();
