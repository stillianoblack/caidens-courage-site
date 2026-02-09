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
const LOGO_SRC = join(publicDir, 'images', 'ui', 'logoCaiden.webp');
const LOGO_480_OUT = join(publicDir, 'images', 'ui', 'logoCaiden_480w.webp');
const WIDTH = 480;
const QUALITY = 82;

async function run() {
  try {
    await sharp(LOGO_SRC)
      .resize(WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(LOGO_480_OUT);
    console.log('Logo 480w written:', LOGO_480_OUT);
  } catch (e) {
    console.warn('optimize-logo: could not generate 480w (source missing or sharp error):', e.message);
  }
}

run();
