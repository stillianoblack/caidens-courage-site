/**
 * Migrate static images into /public/images with subfolders.
 * Classify: hero→heroes, bg/background→backgrounds, character→characters, logo/icon→ui, else images.
 * Do NOT move: favicon.ico, logo192.png, logo512.png, manifest, index.html, robots, _headers, _redirects.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const imagesDir = path.join(publicDir, 'images');
const ext = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif', '.ico']);
const skip = new Set(['favicon.ico', 'logo192.png', 'logo512.png', 'index.html', 'manifest.json', 'robots.txt', '_headers', '_redirects']);

function getFolder(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('hero') || /^hero-/.test(lower)) return 'heroes';
  if (lower.includes('bg') || lower.includes('background')) return 'backgrounds';
  if (lower.includes('character') || lower.includes('profile') || lower.includes('_img_profile') || lower.includes('breathoflife') || lower.includes('dragon_img') || lower.includes('ollie_img') || lower.includes('unclet_img') || lower.includes('maria_img') || lower.includes('b4_img')) return 'characters';
  if (lower.includes('logo') || lower.includes('icon') || lower.includes('watermark')) return 'ui';
  return '';
}

const moves = []; // { from, to, newPath }
const fromOptimized = (name) => path.join(publicDir, 'optimized', name);
const fromRoot = (name) => path.join(publicDir, name);

// Scan public/optimized
if (fs.existsSync(path.join(publicDir, 'optimized'))) {
  for (const name of fs.readdirSync(path.join(publicDir, 'optimized'))) {
    if (!ext.has(path.extname(name).toLowerCase())) continue;
    const from = fromOptimized(name);
    if (!fs.statSync(from).isFile()) continue;
    const folder = getFolder(name);
    const sub = folder ? path.join('images', folder) : 'images';
    const to = path.join(publicDir, sub, name);
    moves.push({ from, to, newPath: `/${sub}/${name}`, oldPath: `/optimized/${name}` });
  }
}

// Scan public/ root (excluding optimized, images, previews, masks)
for (const name of fs.readdirSync(publicDir)) {
  if (skip.has(name)) continue;
  if (['optimized', 'images', 'previews', 'masks'].includes(name)) continue;
  const full = path.join(publicDir, name);
  if (!fs.statSync(full).isDirectory() && ext.has(path.extname(name).toLowerCase())) {
    const folder = getFolder(name);
    const sub = folder ? path.join('images', folder) : 'images';
    const to = path.join(publicDir, sub, name);
    const oldPath = `/${name}`;
    // Avoid overwriting if already moved from optimized
    const existing = moves.find(m => m.newPath === `/${sub}/${name}`);
    if (!existing) {
      moves.push({ from: full, to, newPath: `/${sub}/${name}`, oldPath });
    } else {
      // Prefer optimized version; skip root copy
    }
  }
}

// Ensure target dirs exist
for (const m of moves) {
  fs.mkdirSync(path.dirname(m.to), { recursive: true });
  if (fs.existsSync(m.from)) {
    fs.copyFileSync(m.from, m.to);
    console.log('COPY', m.oldPath, '->', m.newPath);
  }
}

// Output mapping for path updates (oldPath -> newPath)
const mapping = {};
moves.forEach(m => { mapping[m.oldPath] = m.newPath; });
fs.writeFileSync(path.join(root, 'scripts', 'image-path-mapping.json'), JSON.stringify(mapping, null, 2));
console.log('Mapping written to scripts/image-path-mapping.json');
