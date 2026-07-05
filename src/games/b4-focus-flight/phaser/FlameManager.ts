import Phaser from 'phaser';
import type { FlameDefinition, FlameType } from './types';

export interface ManagedFlame extends Phaser.GameObjects.Container {
  flameType: FlameType;
  points: number;
}

interface FlameCreateOptions {
  mobileGraphics?: boolean;
}

export default class FlameManager {
  constructor(private readonly scene: Phaser.Scene) {}

  create(definition: FlameDefinition, x: number, y: number, options: FlameCreateOptions = {}): ManagedFlame {
    const container = this.scene.add.container(x, y) as ManagedFlame;
    container.flameType = definition.id;
    container.points = definition.score;

    const bloom = this.createBloom(definition, options.mobileGraphics);
    const sprite = this.createSprite(definition);
    container.add([...bloom, sprite ?? this.createFallbackFlame(definition)]);

    const pickupRadius = definition.rarity === 'rare' ? 38 : definition.rarity === 'medium' ? 37 : 36;
    container.setData('pickupRadius', pickupRadius);
    container.setData('speed', 265);

    const emitter = this.createSparkEmitter(container, definition, options.mobileGraphics);
    if (emitter) container.setData('sparkEmitter', emitter);
    this.addAmbientSparkles(container, definition, options.mobileGraphics);
    this.addMotion(container, definition);

    return container;
  }

  destroy(flame: ManagedFlame): void {
    const emitter = flame.getData('sparkEmitter') as Phaser.GameObjects.Particles.ParticleEmitter | undefined;
    emitter?.destroy();
    flame.destroy();
  }

  private createSprite(definition: FlameDefinition): Phaser.GameObjects.Image | null {
    if (!this.hasUsableTexture(definition.texture)) return null;

    const sprite = this.scene.add.image(0, 0, definition.texture);
    const displaySize = this.getDisplaySize(definition);
    sprite.setDisplaySize(displaySize.width, displaySize.height);
    sprite.setOrigin(0.5);
    return sprite;
  }

  private createFallbackFlame(definition: FlameDefinition): Phaser.GameObjects.Container {
    const fallback = this.scene.add.container(0, 0);
    const body = this.scene.add.ellipse(0, 7, 24, 38, definition.glowColor, 0.88);
    const tip = this.scene.add.triangle(0, -18, -14, 9, 0, -29, 14, 9, definition.glowColor, 0.9);
    const core = this.scene.add.ellipse(0, 7, 10, 24, 0xfff6bf, 0.82);
    core.setBlendMode(Phaser.BlendModes.ADD);
    fallback.add([tip, body, core]);
    return fallback;
  }

  private createBloom(definition: FlameDefinition, mobileGraphics = false): Phaser.GameObjects.GameObject[] {
    const bloomScale = definition.rarity === 'rare' ? 1.18 : definition.rarity === 'medium' ? 1.08 : 1;
    const outer = this.scene.add.image(0, 5, 'b4-glow-dot').setTint(definition.glowColor);
    outer.setDisplaySize(66 * bloomScale, 106 * bloomScale);
    outer.setAlpha(mobileGraphics ? 0.18 : definition.rarity === 'rare' ? 0.38 : 0.3);
    const mid = this.scene.add.image(0, 3, 'b4-glow-dot').setTint(definition.glowColor);
    mid.setDisplaySize(42 * bloomScale, 76 * bloomScale);
    mid.setAlpha(mobileGraphics ? 0.26 : definition.rarity === 'medium' ? 0.46 : 0.38);
    const halo = this.scene.add.image(0, 2, 'sparkle-dot').setTint(definition.particleColor);
    halo.setDisplaySize(44 * bloomScale, 56 * bloomScale);
    halo.setAlpha(mobileGraphics ? 0.08 : 0.16);
    const core = this.scene.add.image(0, 0, 'sparkle-dot').setTint(0xffffff);
    core.setDisplaySize(20, 46);
    core.setAlpha(0.22);
    [outer, mid, halo, core].forEach((glow) => glow.setBlendMode(Phaser.BlendModes.ADD));
    if (!mobileGraphics) {
      this.scene.tweens.add({
        targets: [outer, mid, halo],
        alpha: '+=0.12',
        scaleX: 1.08,
        scaleY: 1.08,
        duration: definition.rarity === 'rare' ? 620 : 820,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }
    return [outer, mid, halo, core];
  }

  private createSparkEmitter(
    flame: ManagedFlame,
    definition: FlameDefinition,
    mobileGraphics = false,
  ): Phaser.GameObjects.Particles.ParticleEmitter | undefined {
    if (mobileGraphics && definition.rarity === 'common') return undefined;
    const emitter = this.scene.add.particles(flame.x, flame.y, 'sparkle-dot', {
      speed: { min: 6, max: 24 },
      angle: { min: 245, max: 295 },
      lifespan: { min: 420, max: 760 },
      quantity: 1,
      frequency: mobileGraphics ? 280 : definition.rarity === 'rare' ? 120 : definition.rarity === 'medium' ? 150 : 185,
      alpha: { start: 0.95, end: 0 },
      scale: { start: mobileGraphics ? 0.26 : definition.rarity === 'rare' ? 0.46 : 0.38, end: 0 },
      tint: [definition.particleColor, definition.glowColor, 0xffffff],
      blendMode: Phaser.BlendModes.ADD,
    });
    emitter.startFollow(flame, 0, -2);
    return emitter;
  }

  private addAmbientSparkles(container: Phaser.GameObjects.Container, definition: FlameDefinition, mobileGraphics = false): void {
    const sparkleCount = mobileGraphics ? (definition.rarity === 'rare' ? 2 : 1) : definition.rarity === 'rare' ? 5 : definition.rarity === 'medium' ? 4 : 3;
    for (let i = 0; i < sparkleCount; i += 1) {
      const sparkle = this.scene.add.star(
        Phaser.Math.Between(-30, 30),
        Phaser.Math.Between(-34, 32),
        5,
        1.6,
        definition.rarity === 'rare' ? 4.6 : 3.8,
        definition.particleColor,
        0.74,
      );
      sparkle.setBlendMode(Phaser.BlendModes.ADD);
      container.add(sparkle);
      this.scene.tweens.add({
        targets: sparkle,
        alpha: { from: 0.15, to: 0.88 },
        scale: { from: 0.55, to: 1.15 },
        duration: Phaser.Math.Between(560, 920),
        delay: i * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }
  }

  private addMotion(container: Phaser.GameObjects.Container, definition: FlameDefinition): void {
    const floatDistance = definition.rarity === 'rare' ? 12 : 9;
    this.scene.tweens.add({
      targets: container,
      y: container.y + floatDistance * Phaser.Math.RND.sign(),
      scaleX: { from: 0.96, to: 1.05 },
      scaleY: { from: 0.97, to: 1.06 },
      rotation: Phaser.Math.FloatBetween(-0.055, 0.055),
      duration: Phaser.Math.Between(980, 1380),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  private getDisplaySize(definition: FlameDefinition): { width: number; height: number } {
    if (definition.id === 'anchor') return { width: 42, height: 54 };
    if (definition.id === 'ember') return { width: 38, height: 54 };
    return { width: 34, height: 48 };
  }

  private hasUsableTexture(key: string): boolean {
    if (!this.scene.textures.exists(key)) return false;
    const source = this.scene.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined;
    return Boolean(source?.width && source.height);
  }
}
