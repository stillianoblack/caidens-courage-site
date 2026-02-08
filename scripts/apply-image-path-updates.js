const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'image-path-mapping.json'), 'utf8'));

// Sort by key length descending so we replace longest first (e.g. /optimized/foo before /optimized/)
const entries = Object.entries(mapping).sort((a, b) => b[0].length - a[0].length);

function walk(dir, exts, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !['node_modules', 'build', '.git'].includes(name)) {
      walk(full, exts, acc);
    } else if (stat.isFile() && exts.some(e => name.endsWith(e))) {
      acc.push(full);
    }
  }
  return acc;
}

const srcFiles = walk(path.join(root, 'src'), ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.md']);
const publicHtml = path.join(root, 'public', 'index.html');
const files = [...srcFiles];
if (fs.existsSync(publicHtml)) files.push(publicHtml);

let totalReplacements = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [oldPath, newPath] of entries) {
    const re = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const count = (content.match(re) || []).length;
    if (count > 0) {
      content = content.replace(re, newPath);
      changed = true;
      totalReplacements += count;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated:', path.relative(root, file));
  }
}
console.log('Total replacements:', totalReplacements);
