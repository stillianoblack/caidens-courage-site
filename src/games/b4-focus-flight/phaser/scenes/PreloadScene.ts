import Phaser from 'phaser';
import {
  B4_AUDIO_SOURCES,
  B4_ASSET_SOURCES,
  B4_BACKGROUND_LAYER_EXTENSIONS,
  B4_BACKGROUND_LAYER_SOURCES,
  B4_BACKGROUND_SOURCE,
  resolveB4AudioUrl,
  resolveB4AssetUrl,
  resolveB4BackgroundLayerUrl,
} from '../assetKeys';
import { B4_STATE_KEYS, B4_VARIANT_KEYS, B4_VARIANTS, getB4TextureKey } from '../../../../data/b4/variantManifest';

const createSoftDotTexture = (
  scene: Phaser.Scene,
  key: string,
  radius: number,
  color: number,
  alpha = 1,
): void => {
  if (scene.textures.exists(key)) return;
  const size = radius * 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return;

  const red = (color >> 16) & 255;
  const green = (color >> 8) & 255;
  const blue = color & 255;
  const gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  gradient.addColorStop(0.28, `rgba(${red}, ${green}, ${blue}, ${alpha * 0.86})`);
  gradient.addColorStop(0.68, `rgba(${red}, ${green}, ${blue}, ${alpha * 0.24})`);
  gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  scene.textures.addCanvas(key, canvas);
};

const createRainDropTexture = (scene: Phaser.Scene): void => {
  const key = 'rain-drop';
  if (scene.textures.exists(key)) return;
  const width = 14;
  const height = 54;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return;

  const gradient = context.createLinearGradient(width / 2, 0, width / 2, height);
  gradient.addColorStop(0, 'rgba(210, 250, 255, 0)');
  gradient.addColorStop(0.18, 'rgba(210, 250, 255, 0.75)');
  gradient.addColorStop(0.72, 'rgba(108, 214, 255, 0.42)');
  gradient.addColorStop(1, 'rgba(108, 214, 255, 0)');
  context.strokeStyle = gradient;
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(width - 2, 2);
  context.lineTo(2, height - 2);
  context.stroke();
  scene.textures.addCanvas(key, canvas);
};

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`[B-4 Focus Flight] Missing optional asset: ${file.key}`);
    });

    B4_ASSET_SOURCES.forEach((asset) => {
      // SVG remains the source/master art, but Phaser should use exported PNG/WebP
      // runtime assets for predictable loading and performance.
      // TODO(sprite-sheets): Swap these high-resolution first-frame PNG references for
      // B-4 sprite sheets once final production animation exports are ready.
      this.load.image(asset.key, 'url' in asset ? asset.url : resolveB4AssetUrl(asset.folder, asset.file));
    });
    B4_VARIANT_KEYS.forEach((variant) => B4_STATE_KEYS.forEach((state) => {
      this.load.image(getB4TextureKey(variant, state), B4_VARIANTS[variant].states[state].src);
    }));

    B4_AUDIO_SOURCES.forEach((asset) => {
      this.load.audio(asset.key, resolveB4AudioUrl(asset.file));
    });

    this.load.image(
      B4_BACKGROUND_SOURCE.key,
      resolveB4AssetUrl(B4_BACKGROUND_SOURCE.folder, B4_BACKGROUND_SOURCE.file),
    );
  }

  create(): void {
    createSoftDotTexture(this, 'b4-glow-dot', 24, 0x84f7ff, 0.45);
    createSoftDotTexture(this, 'sparkle-dot', 9, 0xfff2a6, 0.9);
    createSoftDotTexture(this, 'trail-dot', 13, 0x5ce8ff, 0.9);
    createRainDropTexture(this);
    if (this.registry.get('b4MobileGraphics') && this.textures.exists(B4_BACKGROUND_SOURCE.key)) {
      this.scene.start('StartScene');
      return;
    }
    this.loadOptionalBackgroundLayers();
  }

  private async loadOptionalBackgroundLayers(): Promise<void> {
    const loadableLayers = (
      await Promise.all(
        B4_BACKGROUND_LAYER_SOURCES
          .filter((layer) => (
            !this.registry.get('b4MobileGraphics') ||
            ['Sky', 'Mountains_Mid', 'Trees_Mid', 'Foreground_Leaves'].includes(layer.label)
          ))
          .map(async (layer) => {
            const url = await this.resolveOptionalLayerUrl(layer.files);
            if (!url) {
              console.warn(`[B-4 Focus Flight] Missing optional background layer: ${layer.label}`);
              return null;
            }
            return { ...layer, url };
          }),
      )
    ).filter((layer): layer is NonNullable<typeof layer> => Boolean(layer));

    if (loadableLayers.length === 0) {
      this.scene.start('StartScene');
      return;
    }

    loadableLayers.forEach((layer) => this.load.image(layer.key, layer.url));
    this.load.once(Phaser.Loader.Events.COMPLETE, () => this.scene.start('StartScene'));
    this.load.start();
  }

  private async optionalAssetExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/') === true;
    } catch {
      return false;
    }
  }

  private async resolveOptionalLayerUrl(fileStems: readonly string[]): Promise<string | null> {
    for (const fileStem of fileStems) {
      for (const extension of B4_BACKGROUND_LAYER_EXTENSIONS) {
        const url = resolveB4BackgroundLayerUrl(fileStem, extension);
        if (await this.optionalAssetExists(url)) return url;
      }
    }
    return null;
  }
}
