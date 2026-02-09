/**
 * Generates 192w and 400w versions of character profile WebPs for responsive delivery.
 * Display sizes: ~96px (cards) and ~270–400px (promo); 1024px source is overkill.
 */
import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const charsDir = join(__dirname, '..', 'public', 'images', 'characters');
const WIDTHS = [192, 400];
const QUALITY = 82;

async function run() {
  let entries;
  try {
    entries = await readdir(charsDir, { withFileTypes: true });
  } catch (e) {
    console.warn('optimize-character-profiles: characters dir not found:', e.message);
    return;
  }
  const webps = entries
    .filter((e) => e.isFile() && e.name.endsWith('.webp') && e.name.includes('_profile'))
    .map((e) => e.name);
  for (const name of webps) {
    const base = name.replace(/\.webp$/, '');
    if (base.endsWith('_192w') || base.endsWith('_400w')) continue;
    const src = join(charsDir, name);
    for (const w of WIDTHS) {
      const out = join(charsDir, `${base}_${w}w.webp`);
      try {
        await sharp(src)
          .resize(w, null, { withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(out);
        console.log('Character profile:', `${base}_${w}w.webp`);
      } catch (e) {
        console.warn(`  skip ${out}:`, e.message);
      }
    }
  }
}

run();
