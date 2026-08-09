#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'public/images/B-4FlightGame/B-4-units');
const outputRoot = path.join(root, 'public/assets/b4');
const variants = ['courage', 'pattern', 'shield', 'anchor', 'fusion'];
const states = ['idle', 'happy', 'hurt', 'blinking'];
const sourceFiles = {
  courage: { idle: 'B-4-courage/Idle/Idle.png', happy: 'B-4-courage/Happy/Happy.png', hurt: 'B-4-courage/Hurt/Hurt.png', blinking: 'B-4-courage/Blinking/Blinking.png' },
  pattern: { idle: 'B-4-pattern/Idle/idle-pattern@caiden.png', happy: 'B-4-pattern/Happy/happy-pattern@caiden.png', hurt: 'B-4-pattern/Hurt/hurt-pattern@caiden.png', blinking: 'B-4-pattern/Blinking/blinking-pattern@caiden.png' },
  shield: { idle: 'B-4-shield/Idle/idle-shield@caiden.png', happy: 'B-4-shield/Happy/happy-shield@caiden.png', hurt: 'B-4-shield/Hurt/hurt-shield@caiden.png', blinking: 'B-4-shield/Blinking/blinking-shield@caiden.png' },
  anchor: { idle: 'B-4-anchor/Idle/idle-fusion_1@caiden.png', happy: 'B-4-anchor/Happy/happy-fusion_1@caiden.png', hurt: 'B-4-anchor/Hurt/hurt-anchor@caiden.png', blinking: 'B-4-anchor/Blinking/blinking-fusion_1@caiden.png' },
  fusion: { idle: 'B-4-fusion/Idle/idle-fusion@caiden.png', happy: 'B-4-fusion/Happy/happy-fusion@caiden.png', hurt: 'B-4-fusion/Hurt/hurt-fusion@caiden.png', blinking: 'B-4-fusion/Blinking/blinking-fusion@caiden.png' },
};

function clearBorderConnectedWhite(data, width, height, channels) {
  const seen = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const enqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pixel = y * width + x;
    if (seen[pixel]) return;
    seen[pixel] = 1;
    const offset = pixel * channels;
    if (data[offset] < 242 || data[offset + 1] < 242 || data[offset + 2] < 242) return;
    queue[tail++] = pixel;
  };
  for (let x = 0; x < width; x += 1) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 0; y < height; y += 1) { enqueue(0, y); enqueue(width - 1, y); }
  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    data[pixel * channels + 3] = 0;
    enqueue(x - 1, y); enqueue(x + 1, y); enqueue(x, y - 1); enqueue(x, y + 1);
  }
}

async function normalizeAsset(inputPath, outputPath) {
  const decoded = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = decoded;
  clearBorderConnectedWhite(data, info.width, info.height, info.channels);
  const trimmed = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toBuffer();
  const fitted = await sharp(trimmed).resize(1080, 600, { fit: 'contain', withoutEnlargement: true }).png().toBuffer();
  const meta = await sharp(fitted).metadata();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp({ create: { width: 1200, height: 680, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: fitted, left: Math.floor((1200 - (meta.width || 0)) / 2), top: Math.floor((680 - (meta.height || 0)) / 2) }])
    .png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(outputPath);
}

async function main() {
  for (const variant of variants) for (const state of states) {
    const input = path.join(sourceRoot, sourceFiles[variant][state]);
    const output = path.join(outputRoot, variant, state, `b4-${variant}-${state}.png`);
    if (!fs.existsSync(input)) throw new Error(`Missing B-4 source: ${input}`);
    await normalizeAsset(input, output);
  }
  console.log(`Built ${variants.length * states.length} normalized B-4 runtime assets.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
