import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const BACKUP_ROOT = path.join(ROOT, 'reports/question-audit-backups');

function listFilesRecursive(dir: string, extension?: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRecursive(fullPath, extension));
    } else if (!extension || fullPath.endsWith(extension)) {
      results.push(fullPath);
    }
  }
  return results;
}

function collectSourceFiles(): string[] {
  const paths = [
    path.join(ROOT, 'src/data/staging/manifest.json'),
    ...listFilesRecursive(path.join(ROOT, 'src/data/b4/missions'), '.ts'),
    ...listFilesRecursive(path.join(ROOT, 'src/data/charlie/missions'), '.ts'),
    ...listFilesRecursive(path.join(ROOT, 'src/data/zeke/missions'), '.ts'),
    ...listFilesRecursive(path.join(ROOT, 'src/data/caiden'), '.ts'),
    ...listFilesRecursive(path.join(ROOT, 'src/data/miranda'), '.ts'),
    ...listFilesRecursive(path.join(ROOT, 'src/data/adult'), '.ts'),
  ];
  return [...new Set(paths)].filter((filePath) => fs.existsSync(filePath));
}

export function createQuestionSourceBackup(label = 'repair'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(BACKUP_ROOT, `${timestamp}-${label}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const copied: string[] = [];
  for (const filePath of collectSourceFiles()) {
    const relative = path.relative(ROOT, filePath);
    const dest = path.join(backupDir, relative);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(filePath, dest);
    copied.push(relative);
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    label,
    fileCount: copied.length,
    files: copied.sort(),
  };
  fs.writeFileSync(path.join(backupDir, 'backup-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  return backupDir;
}
