/**
 * Generates WebP hero images for LCP optimization.
 * - Desktop: max 1600px wide, srcset 640/960/1280/1600
 * - Mobile: max 800px wide, srcset 400/600/800
 * - Target &lt;200KB per file via WebP quality
 */
import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const DESKTOP_SOURCES = ['hero-bg_img_2.png', 'hero-bg_img_2.jpg'];
const MOBILE_SOURCE = 'homepage_hero-bg_mobile_img.jpg';
const DESKTOP_WIDTHS = [640, 960, 1280, 1600];
const MOBILE_WIDTHS = [400, 600, 800];
const WEBP_QUALITY = 78; // target <200KB for 1600w
const MAX_DESKTOP_WIDTH = 1600;
const MAX_MOBILE_WIDTH = 800;

async function findSource(baseName, alternatives) {
  for (const name of alternatives) {
    const path = join(publicDir, name);
    try {
      await sharp(path).metadata();
      return { path, name };
    } catch {
      continue;
    }
  }
  return null;
}

async function generateDesktop() {
  const src = await findSource('hero-bg_img_2', DESKTOP_SOURCES);
  if (!src) {
    console.warn('Desktop hero source not found. Skipping desktop WebP.');
    return;
  }
  const meta = await sharp(src.path).metadata();
  const w = meta.width || 2048;
  const h = meta.height || 1046;
  for (const width of DESKTOP_WIDTHS) {
    const actualW = Math.min(width, w, MAX_DESKTOP_WIDTH);
    const actualH = Math.round((h * actualW) / w);
    const outPath = join(publicDir, `hero-bg_desktop_${actualW}w.webp`);
    const buf = await sharp(src.path)
      .resize(actualW, actualH, { fit: 'inside' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    await writeFile(outPath, buf);
    const kb = (buf.length / 1024).toFixed(1);
    console.log(`  hero-bg_desktop_${actualW}w.webp ${actualW}x${actualH} ${kb}KB`);
  }
}

async function generateMobile() {
  const path = join(publicDir, MOBILE_SOURCE);
  try {
    await sharp(path).metadata();
  } catch {
    console.warn('Mobile hero source not found. Skipping mobile WebP.');
    return;
  }
  const meta = await sharp(path).metadata();
  const w = meta.width || 1180;
  const h = meta.height || 2078;
  for (const width of MOBILE_WIDTHS) {
    const actualW = Math.min(width, w, MAX_MOBILE_WIDTH);
    const actualH = Math.round((h * actualW) / w);
    const outPath = join(publicDir, `hero-bg_mobile_${actualW}w.webp`);
    const buf = await sharp(path)
      .resize(actualW, actualH, { fit: 'inside' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    await writeFile(outPath, buf);
    const kb = (buf.length / 1024).toFixed(1);
    console.log(`  hero-bg_mobile_${actualW}w.webp ${actualW}x${actualH} ${kb}KB`);
  }
}

async function main() {
  console.log('Generating hero WebP images...');
  await generateDesktop();
  await generateMobile();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
