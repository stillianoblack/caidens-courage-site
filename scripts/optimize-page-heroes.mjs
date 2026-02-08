/**
 * Generates WebP hero images for Mission, World, and Characters pages (LCP optimization).
 * Desktop: max 1600px, srcset 640/960/1280/1600. Mobile: max 800px, srcset 400/600/800.
 * Target <200KB per file.
 */
import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const DESKTOP_WIDTHS = [640, 960, 1280, 1600];
const MOBILE_WIDTHS = [400, 600, 800];
const WEBP_QUALITY = 78;
const MAX_DESKTOP_WIDTH = 1600;
const MAX_MOBILE_WIDTH = 800;

async function generateSet(desktopSource, mobileSource, prefix) {
  const processSource = async (sourcePath, widths, maxW, namePrefix) => {
    let path = join(publicDir, sourcePath);
    try {
      await sharp(path).metadata();
    } catch {
      try {
        path = join(publicDir, sourcePath.replace(/\.jpg$/i, '.png').replace(/\.jpeg$/i, '.jpg'));
        await sharp(path).metadata();
      } catch {
        console.warn(`  Skip ${namePrefix}: source not found (${sourcePath})`);
        return;
      }
    }
    const meta = await sharp(path).metadata();
    const w = meta.width || 1600;
    const h = meta.height || 900;
    for (const width of widths) {
      const actualW = Math.min(width, w, maxW);
      const actualH = Math.round((h * actualW) / w);
      const outName = `${prefix}_${namePrefix}_${actualW}w.webp`;
      const outPath = join(publicDir, outName);
      const buf = await sharp(path)
        .resize(actualW, actualH, { fit: 'inside' })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      await writeFile(outPath, buf);
      const kb = (buf.length / 1024).toFixed(1);
      console.log(`  ${outName} ${actualW}x${actualH} ${kb}KB`);
    }
  };
  await processSource(desktopSource, DESKTOP_WIDTHS, MAX_DESKTOP_WIDTH, 'desktop');
  await processSource(mobileSource, MOBILE_WIDTHS, MAX_MOBILE_WIDTH, 'mobile');
}

async function generateCardSet(sourcePath, prefix, widths = [640, 960, 1280]) {
  const path = join(publicDir, sourcePath);
  try {
    await sharp(path).metadata();
  } catch {
    console.warn(`  Skip ${prefix}: ${sourcePath} not found`);
    return;
  }
  const meta = await sharp(path).metadata();
  const w = meta.width || 1280;
  const h = meta.height || 720;
  for (const width of widths) {
    const actualW = Math.min(width, w);
    const actualH = Math.round((h * actualW) / w);
    const outName = `${prefix}_${actualW}w.webp`;
    const outPath = join(publicDir, outName);
    const buf = await sharp(path)
      .resize(actualW, actualH, { fit: 'inside' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    await writeFile(outPath, buf);
    const kb = (buf.length / 1024).toFixed(1);
    console.log(`  ${outName} ${actualW}x${actualH} ${kb}KB`);
  }
}

async function main() {
  console.log('Mission hero...');
  await generateSet('background_ourstory_img.jpg', 'background_ourstory_mobile_img.jpg', 'mission_hero');
  console.log('World hero...');
  await generateSet('background_caidensworld_img.jpg', 'Headers_world_mobile.png', 'world_hero');
  console.log('Characters hero...');
  await generateSet('background_caidenscharacter_img.jpg', 'background_caidenscharacter_mobile_img.jpg', 'characters_hero');
  console.log('World cards (srcset)...');
  await generateCardSet('theknowworld_img.jpg', 'world_card_know');
  await generateCardSet('TheOtherworld_genesis_img.jpg', 'world_card_other');
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
