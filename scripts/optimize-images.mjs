/**
 * Generates responsive WebP variants for hero/logo assets.
 * - Comic cover: 900w, 1600w → public/images/
 * - Logo: 240w, 480w → public/images/ui/
 * Run: node scripts/optimize-images.mjs (or yarn optimize:images).
 */
import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const IMAGES = join(publicDir, 'images');
const UI_DIR = join(IMAGES, 'ui');
const QUALITY = 82;

async function comicCover() {
  const src = join(IMAGES, 'Comic5_Coverpage_header_smaller.webp');
  for (const w of [900, 1600]) {
    const out = join(IMAGES, `Comic5_Coverpage_header_smaller-${w}.webp`);
    try {
      await sharp(src)
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      console.log('Comic cover:', `Comic5_Coverpage_header_smaller-${w}.webp`);
    } catch (e) {
      console.warn(`Comic ${w}w:`, e.message);
    }
  }
}

async function logo() {
  const src = join(UI_DIR, 'logoCaiden.webp');
  for (const w of [240, 480]) {
    const out = join(UI_DIR, `logoCaiden_${w}w.webp`);
    try {
      await sharp(src)
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      console.log('Logo:', `logoCaiden_${w}w.webp`);
    } catch (e) {
      console.warn(`Logo ${w}w:`, e.message);
    }
  }
}

(async () => {
  await comicCover();
  await logo();
})();
