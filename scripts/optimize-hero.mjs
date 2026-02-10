/**
 * Homepage hero LCP optimization: WebP at max 1600px (desktop) / 800px (mobile).
 * - Quality 65 (~60-70) for target under 250KB per file (max 400KB).
 * - Output to public/images/heroes/ (not print resolution).
 */
import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const HERO_DIR = join(publicDir, 'images', 'heroes');

const DESKTOP_SOURCES = ['hero-bg_img_2.png', 'hero-bg_img_2.jpg', 'hero-bg_img_2.webp'];
const MOBILE_SOURCES = ['homepage_hero-bg_mobile_img.jpg', 'homepage_hero-bg_mobile_img.webp'];
const DESKTOP_WIDTHS = [640, 960, 1280, 1600];
const MOBILE_WIDTHS = [400, 600, 800];
const WEBP_QUALITY = 65; // ~60-70, target <250KB (max 400KB)
const MAX_DESKTOP_WIDTH = 1600;
const MAX_MOBILE_WIDTH = 800;

async function findSource(alternatives) {
  for (const name of alternatives) {
    const path = join(HERO_DIR, name);
    try {
      await sharp(path).metadata();
      return path;
    } catch {
      continue;
    }
  }
  return null;
}

async function generateDesktop() {
  const srcPath = await findSource(DESKTOP_SOURCES);
  if (!srcPath) {
    console.warn('Desktop hero source not found in images/heroes. Skipping.');
    return;
  }
  const meta = await sharp(srcPath).metadata();
  const w = Math.min(meta.width || 2048, MAX_DESKTOP_WIDTH);
  const h = meta.height || 1046;
  const aspect = h / (meta.width || 2048);
  for (const width of DESKTOP_WIDTHS) {
    const actualW = Math.min(width, w);
    const actualH = Math.round(actualW * aspect);
    const buf = await sharp(srcPath)
      .resize(actualW, actualH, { fit: 'cover' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    const outPath = join(HERO_DIR, `hero-bg_desktop_${actualW}w.webp`);
    await writeFile(outPath, buf);
    const kb = (buf.length / 1024).toFixed(1);
    console.log(`  hero-bg_desktop_${actualW}w.webp ${actualW}x${actualH} ${kb}KB`);
  }
}

async function generateMobile() {
  const srcPath = await findSource(MOBILE_SOURCES);
  if (!srcPath) {
    console.warn('Mobile hero source not found in images/heroes. Skipping.');
    return;
  }
  const meta = await sharp(srcPath).metadata();
  const w = Math.min(meta.width || 1180, MAX_MOBILE_WIDTH);
  const h = meta.height || 2078;
  const aspect = h / (meta.width || 1180);
  for (const width of MOBILE_WIDTHS) {
    const actualW = Math.min(width, w);
    const actualH = Math.round(actualW * aspect);
    const buf = await sharp(srcPath)
      .resize(actualW, actualH, { fit: 'cover' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    const outPath = join(HERO_DIR, `hero-bg_mobile_${actualW}w.webp`);
    await writeFile(outPath, buf);
    const kb = (buf.length / 1024).toFixed(1);
    console.log(`  hero-bg_mobile_${actualW}w.webp ${actualW}x${actualH} ${kb}KB`);
  }
}

async function main() {
  console.log('Generating homepage hero WebP (max 1600px, quality 65)...');
  await generateDesktop();
  await generateMobile();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
