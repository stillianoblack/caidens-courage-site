#!/usr/bin/env node
import path from 'path';
import { spawnSync } from 'child_process';
import { createQuestionSourceBackup } from './backupQuestionSources';
import { runBuildProductionQualityManifest } from './buildProductionQualityManifest';

const ROOT = path.resolve(__dirname, '../..');

function runStep(label: string, command: string, args: string[]): void {
  console.log(`[quality:pass] ${label}…`);
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

async function main(): Promise<void> {
  console.log('[quality:pass] Creating timestamped backups…');
  const backupDir = createQuestionSourceBackup('quality-pass');
  console.log(`[quality:pass] Backups saved to ${backupDir}`);

  console.log('[quality:pass] Building production quality manifest from latest audit…');
  if (!require('fs').existsSync(path.join(ROOT, 'reports/question-audit.json'))) {
    runStep('audit:questions (initial)', 'yarn', ['audit:questions']);
  }
  const built = runBuildProductionQualityManifest();
  console.log('[quality:pass] Manifest built:', built);

  runStep('repair:questions', 'yarn', ['repair:questions']);

  console.log('');
  console.log('[quality:pass] Done.');
  console.log('- Backups:', backupDir);
  console.log('- Overrides:', built.overrideCount);
  console.log('- Duplicate registry entries:', built.registryCount);
}

main().catch((error) => {
  console.error('[quality:pass] Failed:', error);
  process.exit(1);
});
