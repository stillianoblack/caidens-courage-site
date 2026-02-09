/**
 * Generates a 480w version of the header logo for responsive image delivery.
 * Reduces logo download from ~33 KiB (1500w) to a smaller file when displayed at ~213–256px.
 */
import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const UI_DIR = join(publicDir, 'images', 'ui');
const LOGO_SRC = join(UI_DIR, 'logoCaiden.webp');
const QUALITY = 82;

async function run() {
  for (const w of [240, 480]) {
    const out = join(UI_DIR, `logoCaiden_${w}w.webp`);
    try {
      await sharp(LOGO_SRC)
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      console.log('Logo written:', `logoCaiden_${w}w.webp`);
    } catch (e) {
      console.warn(`optimize-logo: skip ${w}w:`, e.message);
    }
  }
}

run();
