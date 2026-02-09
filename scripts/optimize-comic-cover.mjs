/**
 * Generates 900w and 1600w WebP variants of the comic cover for responsive delivery.
 */
import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const IMAGES = join(publicDir, 'images');
const SRC = join(IMAGES, 'Comic5_Coverpage_header_smaller.webp');
const QUALITY = 82;

async function run() {
  for (const w of [900, 1600]) {
    const out = join(IMAGES, `Comic5_Coverpage_header_smaller-${w}.webp`);
    try {
      await sharp(SRC)
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      console.log('Comic cover:', `Comic5_Coverpage_header_smaller-${w}.webp`);
    } catch (e) {
      console.warn(`optimize-comic-cover: skip ${w}w:`, e.message);
    }
  }
}

run();
