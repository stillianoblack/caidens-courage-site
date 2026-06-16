#!/usr/bin/env node
import path from 'path';
import { spawnSync } from 'child_process';
import { backfillQuestionMetadata } from './backfillQuestionMetadata';
import { createQuestionSourceBackup } from './backupQuestionSources';
import { runBuildProductionQualityManifest } from './buildProductionQualityManifest';

const ROOT = path.resolve(__dirname, '../..');

function runStep(label: string, command: string, args: string[]): void {
  console.log(`[repair:questions] ${label}…`);
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

async function main(): Promise<void> {
  console.log('[repair:questions] Creating timestamped backups…');
  const backupDir = createQuestionSourceBackup('repair');
  console.log(`[repair:questions] Backups saved to ${backupDir}`);

  console.log('[repair:questions] Running metadata backfill…');
  const backfill = backfillQuestionMetadata();
  console.log('[repair:questions] Backfill result:', backfill);

  console.log('[repair:questions] Refreshing audit and reports…');
  runStep('audit:questions (pre-manifest)', 'yarn', ['audit:questions']);

  console.log('[repair:questions] Building production quality manifest…');
  const manifest = runBuildProductionQualityManifest();
  console.log('[repair:questions] Manifest result:', manifest);

  runStep('audit:questions (post-manifest)', 'yarn', ['audit:questions']);

  console.log('');
  console.log('[repair:questions] Done.');
  console.log('- Backups:', backupDir);
  console.log('- Staging overrides updated:', backfill.overridesUpdated);
  console.log('- Explanations added:', backfill.explanationsAdded);
  console.log('- Metadata fields added:', backfill.metadataFieldsAdded);
  console.log('- Reports refreshed under reports/');
}

main().catch((error) => {
  console.error('[repair:questions] Failed:', error);
  process.exit(1);
});
