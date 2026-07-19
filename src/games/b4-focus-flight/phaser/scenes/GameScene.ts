import Phaser from 'phaser';
import {
  B4_AUDIO_KEYS,
  B4_ASSET_KEYS,
  B4_BACKGROUND_LAYER_SOURCES,
  B4_PROCESSED_ASSET_KEYS,
} from '../assetKeys';
import FlameManager, { type ManagedFlame } from '../FlameManager';
import {
  COMBO_WINDOW_MS,
  FLAME_DEFINITIONS,
  GAME_HEIGHT,
  GAME_WIDTH,
  LEVEL_MAX_SECONDS,
  LEVEL_NAME,
  LEVEL_OBJECTIVE,
  LEVEL_SPARK_GOAL,
  PLAYER_X,
  scoreToStars,
  STARTING_HEARTS,
} from '../config';
import {
  B4_FOCUS_FLIGHT_EVENTS,
  emptyFlameCounts,
  type B4FocusFlightHudState,
  type B4FocusFlightResult,
  type FlameDefinition,
} from '../types';
import { getB4TextureKey, normalizeB4Variant, type B4StateKey, type B4VariantKey } from '../../../../data/b4/variantManifest';
import { B4FlightStateMachine } from '../B4FlightStateMachine';

type ObstacleKind = 'cloud' | 'branch' | 'rock' | 'wind';
const PLAYER_TRAIL_SOCKET = {
  x: -56,
  y: 4,
};

const SOUND_MUTED_STORAGE_KEY = 'b4FocusFlightMuted';
const LEGACY_SOUND_MUTED_STORAGE_KEY = 'b4-focus-flight:muted';

const readMutedPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.localStorage.getItem(SOUND_MUTED_STORAGE_KEY) === 'true' ||
      window.localStorage.getItem(LEGACY_SOUND_MUTED_STORAGE_KEY) === 'true'
    );
  } catch {
    return false;
  }
};

const writeMutedPreference = (muted: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SOUND_MUTED_STORAGE_KEY, muted ? 'true' : 'false');
    window.localStorage.removeItem(LEGACY_SOUND_MUTED_STORAGE_KEY);
  } catch {
    /* localStorage unavailable */
  }
};

interface FlightObstacle extends Phaser.GameObjects.Container {
  kind: ObstacleKind;
}

interface ParallaxLayer {
  sprite: Phaser.GameObjects.TileSprite;
  speed: number;
  verticalSpeed?: number;
  baseTilePositionX: number;
  baseTilePositionY: number;
}

interface StormRainLayer {
  sprite: Phaser.GameObjects.TileSprite;
  speedX: number;
  speedY: number;
}

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerSprite?: Phaser.GameObjects.Image;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private flameManager!: FlameManager;
  private flames!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private activeFlames: ManagedFlame[] = [];
  private activeObstacles: FlightObstacle[] = [];
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<'up' | 'down', Phaser.Input.Keyboard.Key>;
  private trail?: Phaser.GameObjects.Particles.ParticleEmitter;
  private score = 0;
  private hearts = STARTING_HEARTS;
  private combo = 0;
  private bestCombo = 0;
  private lastCollectAt = 0;
  private invincible = false;
  private muted = false;
  private gameStarted = false;
  private gameOver = false;
  private elapsedMs = 0;
  private lastHudSecond = LEVEL_MAX_SECONDS;
  private nextFlameMs = 0;
  private nextObstacleMs = 0;
  private flameCounts = emptyFlameCounts();
  private parallaxLayers: ParallaxLayer[] = [];
  private stormRainLayers: StormRainLayer[] = [];
  private foregroundRain?: Phaser.GameObjects.Particles.ParticleEmitter;
  private windWisps?: Phaser.GameObjects.Particles.ParticleEmitter;
  private windStrength = 0;
  private windTimer?: Phaser.Time.TimerEvent;
  private ambientSound?: Phaser.Sound.BaseSound;
  private buttonSound?: Phaser.Sound.BaseSound;
  private successSound?: Phaser.Sound.BaseSound;
  private b4Variant: B4VariantKey = 'courage';
  private b4StateMachine?: B4FlightStateMachine;
  private blinkTimer?: Phaser.Time.TimerEvent;
  private lightningTimer?: Phaser.Time.TimerEvent;
  private mobileGraphics = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.resetState();
    this.prepareProductionTextures();
    this.createAudio();
    this.createBackground();
    this.createPlayer();
    this.flameManager = new FlameManager(this);
    this.createGroups();
    this.createInput();
    this.createParticles();
    this.registerGameEvents();
    this.emitHud();
    this.runCountdown();
  }

  update(time: number, delta: number): void {
    this.animateBackground(delta);
    this.animatePlayer(delta);
    this.syncPlayerTrail();

    if (!this.gameStarted || this.gameOver) return;

    this.elapsedMs += delta;
    this.updateInput(delta);
    this.updateSpawning(this.elapsedMs);
    this.updateWorldObjects(delta);
    this.checkManualCollisions();
    this.cleanupWorld();

    if (this.combo > 0 && time - this.lastCollectAt > COMBO_WINDOW_MS) {
      this.combo = 0;
      this.emitHud();
    }

    const timeLeft = this.getTimeLeft();
    if (timeLeft !== this.lastHudSecond) {
      this.lastHudSecond = timeLeft;
      this.emitHud();
    }

    if (timeLeft <= 0) {
      this.finishMission(false);
    }
  }

  private resetState(): void {
    this.mobileGraphics = Boolean(this.registry.get('b4MobileGraphics'));
    this.score = 0;
    this.hearts = STARTING_HEARTS;
    this.combo = 0;
    this.bestCombo = 0;
    this.lastCollectAt = 0;
    this.invincible = false;
    this.muted = readMutedPreference();
    this.gameStarted = false;
    this.gameOver = false;
    this.elapsedMs = 0;
    this.lastHudSecond = LEVEL_MAX_SECONDS;
    this.nextFlameMs = 0;
    this.nextObstacleMs = 0;
    this.flameCounts = emptyFlameCounts();
    this.parallaxLayers = [];
    this.stormRainLayers = [];
    this.foregroundRain?.destroy();
    this.foregroundRain = undefined;
    this.windWisps?.destroy();
    this.windWisps = undefined;
    this.windStrength = 0;
    this.activeFlames = [];
    this.activeObstacles = [];
    this.playerSprite = undefined;
    this.b4Variant = normalizeB4Variant(this.registry.get('b4Variant'));
    this.b4StateMachine?.dispose();
    this.b4StateMachine = undefined;
    this.blinkTimer?.remove(false);
    this.blinkTimer = undefined;
    this.lightningTimer?.remove(false);
    this.lightningTimer = undefined;
    this.windTimer?.remove(false);
    this.windTimer = undefined;
    this.stopAmbientAudio();
    this.ambientSound = undefined;
    this.buttonSound = undefined;
    this.successSound = undefined;
  }

  private createAudio(): void {
    this.ambientSound = this.createSound(B4_AUDIO_KEYS.ambient, {
      loop: true,
      volume: 0.32,
    });
    this.buttonSound = this.createSound(B4_AUDIO_KEYS.button, {
      volume: 0.42,
    });
    this.successSound = this.createSound(B4_AUDIO_KEYS.success, {
      volume: 0.58,
    });
  }

  private createSound(key: string, config?: Phaser.Types.Sound.SoundConfig): Phaser.Sound.BaseSound | undefined {
    if (!this.cache.audio.exists(key)) {
      console.warn(`[B-4 Focus Flight] Missing optional audio: ${key}`);
      return undefined;
    }
    return this.sound.add(key, config);
  }

  private createBackground(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x081329).setOrigin(0);
    const hasLayeredBackground = !this.mobileGraphics && B4_BACKGROUND_LAYER_SOURCES.some((layer) => this.textures.exists(layer.key));

    if (!hasLayeredBackground && this.textures.exists(B4_ASSET_KEYS.gameplayBackground)) {
      this.addCoverImage(0, 0, GAME_WIDTH, GAME_HEIGHT, B4_ASSET_KEYS.gameplayBackground);
    } else if (!hasLayeredBackground) {
      console.warn('[B-4 Focus Flight] Missing optional asset: cinematic gameplay background');
      this.createGeneratedForestFallback();
    }

    if (!this.mobileGraphics) {
      this.createOptionalBackgroundLayers();
    }
    this.createAtmosphereLayers();
    this.createCinematicRain();
    this.createWindEffects();
    this.createReadabilityOverlay();
    this.scheduleLightningFlash(this.mobileGraphics ? Phaser.Math.Between(8000, 13000) : Phaser.Math.Between(2200, 3600));
    if (!this.mobileGraphics) {
      this.scheduleWindGust();
    }
  }

  private createGeneratedForestFallback(): void {
    const mist = this.add.graphics();
    mist.fillGradientStyle(0x183568, 0x23346f, 0x10233e, 0x0a1729, 1);
    mist.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.addParallaxLayer(this.createLayerTexture('stars', 0), 0, 0.08);
    this.addParallaxLayer(this.createLayerTexture('canopy-back', 1), 55, 0.25);
    this.addParallaxLayer(this.createLayerTexture('canopy-front', 2), 160, 0.55);
  }

  private createAtmosphereLayers(): void {
    // TODO(background-layers): Add any future transparent layers to B4_BACKGROUND_LAYER_SOURCES
    // using this order: Sky, Stars, Clouds, Mountains_Far, Mountains_Mid, Trees_Far,
    // Trees_Mid, Foreground_Leaves, Fog, Rain.

    if (!this.textures.exists('b4-bg-layer-rain')) {
      this.addParallaxLayer(this.createLayerTexture('b4ff-rain-layer', 3), 0, 1, -0.07, 0.5);
    }
    if (!this.textures.exists('b4-bg-layer-fog')) {
      this.addParallaxLayer(this.createLayerTexture('b4ff-fog-layer', 4), 0, 0.75, 0, 0.28);
    }
    if (!this.mobileGraphics) {
      this.addParallaxLayer(this.createLayerTexture('b4ff-firefly-layer', 5), 0, 0.08, 0, 0.72);
    }
  }

  private createCinematicRain(): void {
    const rainBack = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, this.createRainTexture('b4ff-rain-back', this.mobileGraphics ? 190 : 128, 1.4, 0.24));
    rainBack.setOrigin(0);
    rainBack.setAlpha(this.mobileGraphics ? 0.28 : 0.42);
    rainBack.setBlendMode(Phaser.BlendModes.ADD);

    const rainMid = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, this.createRainTexture('b4ff-rain-mid', this.mobileGraphics ? 150 : 92, 1.7, 0.32));
    rainMid.setOrigin(0);
    rainMid.setAlpha(this.mobileGraphics ? 0.22 : 0.34);
    rainMid.setBlendMode(Phaser.BlendModes.ADD);

    this.stormRainLayers.push(
      { sprite: rainBack, speedX: -0.08, speedY: 0.38 },
      { sprite: rainMid, speedX: -0.13, speedY: 0.56 },
    );

    if (!this.mobileGraphics) {
      const rainFront = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, this.createRainTexture('b4ff-rain-front', 66, 2.1, 0.42));
      rainFront.setOrigin(0);
      rainFront.setAlpha(0.36);
      rainFront.setBlendMode(Phaser.BlendModes.ADD);
      this.stormRainLayers.push({ sprite: rainFront, speedX: -0.22, speedY: 0.86 });
    }

    this.foregroundRain = this.add.particles(GAME_WIDTH / 2, -40, 'rain-drop', {
      x: { min: -120, max: GAME_WIDTH + 120 },
      y: -40,
      speedX: { min: -220, max: -90 },
      speedY: { min: 720, max: 980 },
      lifespan: { min: 760, max: 1040 },
      quantity: this.mobileGraphics ? 1 : 3,
      frequency: this.mobileGraphics ? 95 : 30,
      alpha: { start: this.mobileGraphics ? 0.36 : 0.58, end: 0 },
      scaleX: { start: 0.86, end: 0.58 },
      scaleY: { start: 1.36, end: 0.82 },
      tint: [0x9fefff, 0xc7f7ff, 0x7fc9ff],
      blendMode: Phaser.BlendModes.ADD,
    });
  }

  private createWindEffects(): void {
    if (this.mobileGraphics) return;
    this.windWisps = this.add.particles(-80, GAME_HEIGHT * 0.48, 'rain-drop', {
      x: -80,
      y: { min: 120, max: GAME_HEIGHT - 90 },
      speedX: { min: 520, max: 860 },
      speedY: { min: -85, max: 35 },
      lifespan: { min: 900, max: 1350 },
      quantity: 1,
      frequency: 155,
      alpha: { start: 0.12, end: 0 },
      scaleX: { start: 1.5, end: 0.85 },
      scaleY: { start: 0.42, end: 0.2 },
      tint: [0xbdf8ff, 0x74dfff],
      blendMode: Phaser.BlendModes.ADD,
    });
  }

  private scheduleWindGust(): void {
    this.windTimer?.remove(false);
    this.windTimer = this.time.delayedCall(Phaser.Math.Between(4200, 7600), () => {
      this.playWindGust();
      this.scheduleWindGust();
    });
  }

  private playWindGust(): void {
    const gustLine = this.add.graphics();
    gustLine.lineStyle(3, 0xc7faff, 0.18);
    for (let i = 0; i < 5; i += 1) {
      const y = Phaser.Math.Between(140, GAME_HEIGHT - 130);
      gustLine.beginPath();
      gustLine.moveTo(-80, y);
      gustLine.lineTo(GAME_WIDTH + 120, y + Phaser.Math.Between(-52, 22));
      gustLine.strokePath();
    }
    gustLine.setBlendMode(Phaser.BlendModes.ADD);
    gustLine.setAlpha(0);

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 380,
      yoyo: true,
      hold: 520,
      ease: 'Sine.InOut',
      onUpdate: (tween) => {
        this.windStrength = tween.getValue() ?? 0;
      },
      onComplete: () => {
        this.windStrength = 0;
      },
    });
    this.tweens.add({
      targets: gustLine,
      alpha: { from: 0, to: 1 },
      x: 90,
      duration: 420,
      yoyo: true,
      hold: 260,
      ease: 'Sine.Out',
      onComplete: () => gustLine.destroy(),
    });
  }

  private createRainTexture(key: string, spacing: number, lineWidth: number, alpha: number): string {
    if (this.textures.exists(key)) return key;
    const width = 384;
    const height = 384;
    const graphics = this.add.graphics();
    graphics.lineStyle(lineWidth, 0xb8f3ff, alpha);
    for (let x = -width; x < width * 2; x += spacing) {
      const offset = Phaser.Math.Between(-36, 36);
      graphics.lineBetween(x + offset, -20, x - 84 + offset, height + 44);
    }
    graphics.generateTexture(key, width, height);
    graphics.destroy();
    return key;
  }

  private createOptionalBackgroundLayers(): void {
    B4_BACKGROUND_LAYER_SOURCES.forEach((layer) => {
      if (!this.textures.exists(layer.key)) return;
      const alpha = 'alpha' in layer ? layer.alpha : 1;
      const blend = 'blend' in layer ? layer.blend : 'normal';
      this.addParallaxLayer(this.getRenderableBackgroundLayerKey(layer.key), 0, layer.speed, 0, alpha, true, blend);
    });
  }

  private addParallaxLayer(
    textureKey: string,
    y: number,
    speed: number,
    verticalSpeed = 0,
    alpha = 1,
    cover = false,
    blend: 'normal' | 'add' = 'normal',
  ): void {
    const sprite = this.add.tileSprite(0, y, GAME_WIDTH, GAME_HEIGHT, textureKey).setOrigin(0);
    if (cover) {
      const source = sprite.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      const scale = Math.max(GAME_WIDTH / source.width, GAME_HEIGHT / source.height);
      sprite.setTileScale(scale, scale);
      sprite.tilePositionX = Math.max(0, (source.width - GAME_WIDTH / scale) / 2);
      sprite.tilePositionY = Math.max(0, (source.height - GAME_HEIGHT / scale) / 2);
    }
    sprite.setAlpha(alpha);
    if (blend === 'add') sprite.setBlendMode(Phaser.BlendModes.ADD);
    this.parallaxLayers.push({
      sprite,
      speed,
      verticalSpeed,
      baseTilePositionX: sprite.tilePositionX,
      baseTilePositionY: sprite.tilePositionY,
    });
  }

  private addCoverImage(x: number, y: number, width: number, height: number, textureKey: string): Phaser.GameObjects.Image {
    const image = this.add.image(x + width / 2, y + height / 2, textureKey);
    const frame = image.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const scale = Math.max(width / frame.width, height / frame.height);
    image.setScale(scale);
    image.setOrigin(0.5);
    return image;
  }

  private createReadabilityOverlay(): void {
    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x030712, 0x030712, 0x081225, 0x081225, 0.42, 0.34, 0.12, 0.32);
    vignette.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    vignette.fillStyle(0x020716, 0.2);
    vignette.fillRect(0, 0, GAME_WIDTH, 118);

    const glow = this.add.ellipse(GAME_WIDTH * 0.7, GAME_HEIGHT * 0.52, 460, 280, 0x50f4ff, 0.06);
    if (this.mobileGraphics) {
      glow.setAlpha(0.035);
    }
    glow.setBlendMode(Phaser.BlendModes.ADD);
  }

  private scheduleLightningFlash(delay = Phaser.Math.Between(6500, 12000)): void {
    this.lightningTimer?.remove(false);
    this.lightningTimer = this.time.delayedCall(delay, () => {
      this.playLightningFlash();
      this.scheduleLightningFlash();
    });
  }

  private playLightningFlash(): void {
    const flash = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.66, 0xd5edff, this.mobileGraphics ? 0.22 : 0.34).setOrigin(0);
    flash.setBlendMode(Phaser.BlendModes.ADD);

    const mood = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x20456f, 0.16).setOrigin(0);
    mood.setBlendMode(Phaser.BlendModes.ADD);

    const bolt = this.add.graphics();
    bolt.lineStyle(5, 0xd9f8ff, 0.9);
    const startX = Phaser.Math.Between(690, 1040);
    let x = startX;
    let y = 8;
    bolt.beginPath();
    bolt.moveTo(x, y);
    for (let i = 0; i < 8; i += 1) {
      x += Phaser.Math.Between(-52, 34);
      y += Phaser.Math.Between(24, 44);
      bolt.lineTo(x, y);
    }
    bolt.strokePath();
    bolt.lineStyle(12, 0x7fe9ff, 0.2);
    bolt.strokePath();
    bolt.setBlendMode(Phaser.BlendModes.ADD);

    if (this.gameStarted && !this.gameOver) {
      this.cameras.main.shake(110, 0.0025);
    }

    this.tweens.add({
      targets: [flash, mood],
      alpha: 0,
      duration: 480,
      ease: 'Cubic.Out',
      onComplete: () => {
        flash.destroy();
        mood.destroy();
      },
    });
    this.tweens.add({
      targets: bolt,
      alpha: 0,
      duration: 260,
      delay: 80,
      ease: 'Cubic.Out',
      onComplete: () => bolt.destroy(),
    });
  }

  private createLayerTexture(key: string, layer: number): string {
    if (this.textures.exists(key)) return key;

    const graphics = this.add.graphics();
    if (layer === 0) {
      for (let i = 0; i < 95; i += 1) {
        graphics.fillStyle(i % 7 === 0 ? 0xffd86d : 0x9bf5ff, Phaser.Math.FloatBetween(0.18, 0.65));
        graphics.fillCircle(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(10, 360), Phaser.Math.Between(1, 3));
      }
    }

    if (layer === 1 || layer === 2) {
      const color = layer === 1 ? 0x123553 : 0x0f4b58;
      const alpha = layer === 1 ? 0.45 : 0.58;
      for (let i = 0; i < 18; i += 1) {
        const x = i * 86 + Phaser.Math.Between(-20, 20);
        const height = Phaser.Math.Between(layer === 1 ? 180 : 240, layer === 1 ? 420 : 520);
        graphics.fillStyle(color, alpha);
        graphics.fillEllipse(x, GAME_HEIGHT - height + 45, Phaser.Math.Between(120, 190), Phaser.Math.Between(260, 420));
        graphics.fillStyle(layer === 1 ? 0x1d6d69 : 0x21a18d, alpha * 0.55);
        graphics.fillTriangle(x - 55, GAME_HEIGHT - height + 60, x + 20, GAME_HEIGHT - height - 70, x + 90, GAME_HEIGHT - height + 80);
      }
    }

    if (layer === 3) {
      graphics.lineStyle(2, 0x8cf4ff, 0.13);
      for (let i = 0; i < 60; i += 1) {
        const x = Phaser.Math.Between(0, GAME_WIDTH);
        const y = Phaser.Math.Between(0, GAME_HEIGHT);
        graphics.lineBetween(x, y, x - 18, y + 46);
      }
    }

    if (layer === 4) {
      for (let i = 0; i < 16; i += 1) {
        graphics.fillStyle(0xb7f4ff, Phaser.Math.FloatBetween(0.035, 0.085));
        graphics.fillEllipse(
          Phaser.Math.Between(-80, GAME_WIDTH + 80),
          Phaser.Math.Between(150, GAME_HEIGHT + 80),
          Phaser.Math.Between(180, 420),
          Phaser.Math.Between(36, 92),
        );
      }
    }

    if (layer === 5) {
      for (let i = 0; i < 40; i += 1) {
        graphics.fillStyle(i % 5 === 0 ? 0xffdf7f : 0x9df8ff, Phaser.Math.FloatBetween(0.25, 0.55));
        graphics.fillCircle(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(40, GAME_HEIGHT - 110), Phaser.Math.Between(1, 3));
      }
    }

    graphics.generateTexture(key, GAME_WIDTH, GAME_HEIGHT);
    graphics.destroy();
    return key;
  }

  private createPlayer(): void {
    this.player = this.add.container(PLAYER_X, GAME_HEIGHT / 2);

    const trailGlow = this.add.image(-38, 4, 'b4-glow-dot').setTint(0x62f2ff);
    trailGlow.setDisplaySize(92, 36);
    trailGlow.setAlpha(0.22);
    trailGlow.setBlendMode(Phaser.BlendModes.ADD);
    const rimGlow = this.add.image(-10, 1, 'b4-glow-dot').setTint(0x89fbff);
    rimGlow.setDisplaySize(120, 52);
    rimGlow.setAlpha(0.18);
    rimGlow.setBlendMode(Phaser.BlendModes.ADD);
    const exhaustSocket = this.add.image(PLAYER_TRAIL_SOCKET.x, PLAYER_TRAIL_SOCKET.y, 'trail-dot').setTint(0x6af7ff);
    exhaustSocket.setDisplaySize(24, 16);
    exhaustSocket.setAlpha(0.7);
    exhaustSocket.setBlendMode(Phaser.BlendModes.ADD);

    const idleTexture = getB4TextureKey(this.b4Variant, 'idle');
    if (this.hasUsableTexture(idleTexture)) {
      this.playerSprite = this.add.image(0, 0, idleTexture);
      this.playerSprite.setDisplaySize(108, 61);
      this.playerSprite.setOrigin(0.5);
      this.player.add([trailGlow, rimGlow, exhaustSocket, this.playerSprite]);
      this.b4StateMachine = new B4FlightStateMachine(
        (state) => this.applyB4StateTexture(state),
        (delay, callback) => this.time.delayedCall(delay, callback),
        (timer) => (timer as Phaser.Time.TimerEvent).remove(false),
      );
      this.scheduleNextBlink();
    } else {
      this.player.add([trailGlow, rimGlow, exhaustSocket, ...this.createPlaceholderB4()]);
    }

    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setCircle(27, -27, -27);
    this.playerBody.setCollideWorldBounds(true);
  }

  private createPlaceholderB4(): Phaser.GameObjects.GameObject[] {
    const head = this.add.circle(0, 0, 38, 0x2cbbff, 1);
    const face = this.add.circle(0, 2, 30, 0x97f6ff, 0.5);
    const antenna = this.add.rectangle(0, -48, 6, 24, 0x84efff);
    const antennaDot = this.add.circle(0, -64, 8, 0xffd86b);
    const eyeLeft = this.add.circle(-14, -5, 6, 0x071426);
    const eyeRight = this.add.circle(14, -5, 6, 0x071426);
    const smile = this.add.graphics();
    smile.lineStyle(4, 0x07315a, 0.75);
    smile.beginPath();
    smile.arc(0, 7, 13, Phaser.Math.DegToRad(24), Phaser.Math.DegToRad(156), false);
    smile.strokePath();
    const wingLeft = this.add.ellipse(-42, 5, 20, 34, 0x74f4ff, 0.45);
    const wingRight = this.add.ellipse(42, 5, 20, 34, 0x74f4ff, 0.45);
    return [wingLeft, wingRight, antenna, antennaDot, head, face, eyeLeft, eyeRight, smile];
  }

  private createGroups(): void {
    this.flames = this.physics.add.group();
    this.obstacles = this.physics.add.group();
  }

  private createInput(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    const keys = this.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
    });
    this.wasd = keys as Record<'up' | 'down', Phaser.Input.Keyboard.Key> | undefined;

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.gameOver) return;
      if (pointer.isDown) {
        this.movePlayerTo(pointer.y, true);
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.gameOver) return;
      this.movePlayerTo(pointer.y, true);
    });
  }

  private createParticles(): void {
    const socket = this.getPlayerTrailSocketWorldPosition();
    this.trail = this.add.particles(socket.x, socket.y, 'trail-dot', {
      speedX: { min: this.mobileGraphics ? -108 : -128, max: -42 },
      speedY: { min: this.mobileGraphics ? -12 : -16, max: this.mobileGraphics ? 12 : 16 },
      lifespan: { min: this.mobileGraphics ? 390 : 460, max: this.mobileGraphics ? 520 : 610 },
      alpha: { start: 1, end: 0 },
      scale: { start: this.mobileGraphics ? 0.68 : 0.86, end: 0 },
      tint: [0x9dffff, 0x5ce8ff, 0x4b83ff],
      frequency: this.mobileGraphics ? 20 : 12,
      blendMode: Phaser.BlendModes.ADD,
    });
  }

  private movePlayerTo(y: number, resetTrailOnJump = false): void {
    const nextY = Phaser.Math.Clamp(y, 80, GAME_HEIGHT - 80);
    const jumped = Math.abs(nextY - this.player.y) > 72;
    this.player.y = nextY;
    if (resetTrailOnJump && jumped) {
      this.resetTrail();
    }
  }

  private resetTrail(): void {
    this.trail?.killAll();
  }

  private syncPlayerTrail(): void {
    if (!this.trail) return;
    const socket = this.getPlayerTrailSocketWorldPosition();
    this.trail.setPosition(socket.x, socket.y);
  }

  private getPlayerTrailSocketWorldPosition(): { x: number; y: number } {
    return this.player.getWorldTransformMatrix().transformPoint(PLAYER_TRAIL_SOCKET.x, PLAYER_TRAIL_SOCKET.y);
  }

  private registerGameEvents(): void {
    this.game.events.on(B4_FOCUS_FLIGHT_EVENTS.pauseToggle, this.togglePause, this);
    this.game.events.on(B4_FOCUS_FLIGHT_EVENTS.muteToggle, this.toggleMute, this);
    this.game.events.on(B4_FOCUS_FLIGHT_EVENTS.restart, this.restartMission, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(B4_FOCUS_FLIGHT_EVENTS.pauseToggle, this.togglePause, this);
      this.game.events.off(B4_FOCUS_FLIGHT_EVENTS.muteToggle, this.toggleMute, this);
      this.game.events.off(B4_FOCUS_FLIGHT_EVENTS.restart, this.restartMission, this);
      this.b4StateMachine?.dispose();
      this.b4StateMachine = undefined;
      this.blinkTimer?.remove(false);
      this.blinkTimer = undefined;
      this.stopAmbientAudio();
    });
  }

  private runCountdown(): void {
    const label = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '3', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '118px',
        color: '#fff4a8',
        stroke: '#17305f',
        strokeThickness: 12,
      })
      .setOrigin(0.5);

    const beats = ['3', '2', '1', 'Fly!'];
    beats.forEach((beat, index) => {
      this.time.delayedCall(index * 820, () => {
        label.setText(beat);
        label.setScale(0.6);
        label.setAlpha(0.35);
        this.tweens.add({
          targets: label,
          scale: 1,
          alpha: 1,
          duration: 220,
          ease: 'Back.Out',
        });
      });
    });

    this.time.delayedCall(beats.length * 820, () => {
      label.destroy();
      this.gameStarted = true;
      this.startAmbientAudio();
      this.emitHud();
    });
  }

  private animateBackground(delta: number): void {
    this.parallaxLayers.forEach((layer) => {
      layer.sprite.tilePositionX += delta * layer.speed * 0.04;
      if (layer.verticalSpeed) {
        layer.sprite.tilePositionY += delta * layer.verticalSpeed;
      } else {
        layer.sprite.tilePositionY = layer.baseTilePositionY;
      }
    });

    this.stormRainLayers.forEach((layer) => {
      layer.sprite.tilePositionX += delta * (layer.speedX - this.windStrength * 0.18);
      layer.sprite.tilePositionY += delta * (layer.speedY + this.windStrength * 0.08);
    });
  }

  private animatePlayer(delta: number): void {
    this.player.rotation = Phaser.Math.Clamp(this.playerBody.velocity.y / 900, -0.22, 0.22);
    this.player.y += Math.sin((this.elapsedMs + delta) / 220) * 0.08;
  }

  private updateInput(delta: number): void {
    const speed = 430;
    let direction = 0;
    if (this.cursors?.up.isDown || this.wasd?.up.isDown) direction -= 1;
    if (this.cursors?.down.isDown || this.wasd?.down.isDown) direction += 1;

    if (direction !== 0) {
      this.player.y = Phaser.Math.Clamp(this.player.y + direction * speed * (delta / 1000), 80, GAME_HEIGHT - 80);
      this.playerBody.setVelocityY(direction * speed);
    } else {
      this.playerBody.setVelocityY(0);
    }
  }

  private updateSpawning(missionMs: number): void {
    if (missionMs >= this.nextFlameMs) {
      this.spawnFlame();
      this.nextFlameMs = missionMs + Phaser.Math.Between(520, 880);
    }

    if (missionMs >= this.nextObstacleMs) {
      this.spawnObstacle();
      this.nextObstacleMs = missionMs + Phaser.Math.Between(930, 1450);
    }
  }

  private spawnFlame(): void {
    const definition = this.pickFlame();
    const x = GAME_WIDTH + 80;
    const y = Phaser.Math.Between(90, GAME_HEIGHT - 90);
    const container = this.flameManager.create(definition, x, y, { mobileGraphics: this.mobileGraphics });
    this.flames.add(container);
    this.activeFlames.push(container);
  }

  private pickFlame(): FlameDefinition {
    const total = FLAME_DEFINITIONS.reduce((sum, flame) => sum + flame.spawnWeight, 0);
    let roll = Phaser.Math.Between(1, total);
    for (const definition of FLAME_DEFINITIONS) {
      roll -= definition.spawnWeight;
      if (roll <= 0) return definition;
    }
    return FLAME_DEFINITIONS[0];
  }

  private spawnObstacle(): void {
    const kinds: ObstacleKind[] = ['cloud', 'branch', 'rock', 'wind'];
    const kind = Phaser.Utils.Array.GetRandom(kinds);
    const x = GAME_WIDTH + 110;
    const y = Phaser.Math.Between(95, GAME_HEIGHT - 95);
    const obstacle = this.add.container(x, y) as FlightObstacle;
    obstacle.kind = kind;

    if (kind === 'cloud') {
      if (this.hasUsableTexture(B4_PROCESSED_ASSET_KEYS.cloudObstacle)) {
        const cloud = this.add.image(0, 0, B4_PROCESSED_ASSET_KEYS.cloudObstacle);
        cloud.setDisplaySize(122, 68);
        cloud.setAlpha(0.88);
        obstacle.add(cloud);
      } else {
        const cloud = this.add.graphics();
        cloud.fillStyle(0x6f7da2, 0.76);
        cloud.fillEllipse(-30, 8, 58, 38);
        cloud.fillStyle(0x8795bb, 0.74);
        cloud.fillEllipse(0, -8, 72, 48);
        cloud.fillStyle(0x5d6a8e, 0.7);
        cloud.fillEllipse(38, 10, 54, 34);
        obstacle.add(cloud);
      }
    } else if (kind === 'branch') {
      obstacle.setRotation(Phaser.Math.DegToRad(Phaser.Math.Between(-12, 12)));
      if (this.hasUsableTexture(B4_PROCESSED_ASSET_KEYS.logObstacle)) {
        const log = this.add.image(0, 0, B4_PROCESSED_ASSET_KEYS.logObstacle);
        log.setDisplaySize(138, 42);
        obstacle.add(log);
      } else {
        obstacle.add(this.add.rectangle(0, 0, 124, 18, 0x5b3d2e));
      }
    } else if (kind === 'rock') {
      obstacle.add([
        this.add.polygon(0, 0, '-40 28 -24 -30 22 -42 48 -4 28 38 -18 44', 0x5f6f83, 0.95),
        this.add.polygon(-8, -4, '-24 10 -8 -20 20 -18 30 4 12 24 -20 22', 0xaab8c4, 0.18),
      ]);
    } else {
      const spiral = this.add.graphics();
      spiral.lineStyle(8, 0x9cf7ff, 0.64);
      spiral.beginPath();
      for (let i = 0; i < 42; i += 1) {
        const angle = i * 0.42;
        const radius = i * 1.4;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius * 0.62;
        if (i === 0) spiral.moveTo(px, py);
        else spiral.lineTo(px, py);
      }
      spiral.strokePath();
      obstacle.add(spiral);
    }

    obstacle.setData('speed', kind === 'wind' ? 360 : 300);
    obstacle.setData('radius', kind === 'branch' ? 62 : 46);
    this.obstacles.add(obstacle);
    this.activeObstacles.push(obstacle);
  }

  private collectFlame(flame: ManagedFlame): void {
    if (!flame.active) return;
    const now = this.time.now;
    this.combo = now - this.lastCollectAt <= COMBO_WINDOW_MS ? this.combo + 1 : 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.lastCollectAt = now;

    const bonus = this.combo * 2;
    const gained = flame.points + bonus;
    this.score += gained;
    this.flameCounts[flame.flameType] += 1;
    this.showB4Expression('happy', 250);
    this.playAudioHook(this.combo > 2 ? 'combo up' : 'collect flame');
    this.floatScore(`+${gained}`, flame.x, flame.y, this.combo > 3 ? '#fff0a8' : '#ffffff');
    this.sparkle(flame.x, flame.y);
    this.flameManager.destroy(flame);
    this.emitHud();

    if (flame.flameType === 'spark' && this.flameCounts.spark >= LEVEL_SPARK_GOAL) {
      this.finishMission(true);
    }
  }

  private hitObstacle(obstacle: FlightObstacle): void {
    if (this.invincible || !obstacle.active) return;
    obstacle.destroy();
    this.hearts -= 1;
    this.combo = 0;
    this.invincible = true;
    this.showB4Expression('hurt', 1100);
    this.playAudioHook('hit obstacle');
    this.cameras.main.shake(180, 0.008);
    this.cameras.main.flash(150, 146, 238, 255, true);
    this.tweens.add({
      targets: this.player,
      alpha: 0.35,
      duration: 85,
      yoyo: true,
      repeat: 7,
      onComplete: () => {
        this.player.setAlpha(1);
        this.invincible = false;
        this.showB4Expression('idle');
      },
    });
    this.emitHud();

    if (this.hearts <= 0) {
      this.finishMission(false);
    }
  }

  private floatScore(text: string, x: number, y: number, color: string): void {
    const scoreText = this.add
      .text(x, y, text, {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '34px',
        color,
        stroke: '#12204a',
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: scoreText,
      y: y - 72,
      alpha: 0,
      scale: 1.25,
      duration: 760,
      ease: 'Cubic.Out',
      onComplete: () => scoreText.destroy(),
    });
  }

  private sparkle(x: number, y: number): void {
    const particles = this.add.particles(x, y, 'sparkle-dot', {
      speed: { min: 60, max: this.mobileGraphics ? 150 : 220 },
      angle: { min: 0, max: 360 },
      lifespan: this.mobileGraphics ? 390 : 520,
      quantity: this.mobileGraphics ? 7 : 18,
      scale: { start: this.mobileGraphics ? 0.78 : 1.1, end: 0 },
      blendMode: Phaser.BlendModes.ADD,
    });
    this.time.delayedCall(this.mobileGraphics ? 80 : 120, () => particles.stop());
    this.time.delayedCall(this.mobileGraphics ? 520 : 760, () => particles.destroy());
  }

  private updateWorldObjects(delta: number): void {
    const seconds = delta / 1000;
    this.activeFlames.forEach((flame) => {
      flame.x -= (flame.getData('speed') as number) * seconds;
    });
    this.activeObstacles.forEach((obstacle) => {
      obstacle.x -= (obstacle.getData('speed') as number) * seconds;
    });
  }

  private checkManualCollisions(): void {
    this.activeFlames.forEach((flame) => {
      const pickupRadius = (flame.getData('pickupRadius') as number | undefined) ?? 48;
      if (flame.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, flame.x, flame.y) < pickupRadius) {
        this.collectFlame(flame);
      }
    });

    this.activeObstacles.forEach((obstacle) => {
      const radius = (obstacle.getData('radius') as number) || 50;
      if (obstacle.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, obstacle.x, obstacle.y) < radius + 31) {
        this.hitObstacle(obstacle);
      }
    });
  }

  private cleanupWorld(): void {
    this.activeFlames = this.activeFlames.filter((flame) => {
      if (!flame.active) return false;
      if (flame.x < -140) {
        this.flameManager.destroy(flame);
        return false;
      }
      return true;
    });
    this.activeObstacles = this.activeObstacles.filter((obstacle) => {
      if (!obstacle.active || obstacle.x < -160) {
        obstacle.destroy();
        return false;
      }
      return true;
    });
  }

  private finishMission(completed: boolean): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.gameStarted = false;
    this.stopAmbientAudio();
    if (completed) {
      this.playAudioHook('mission complete');
    }
    const stars = scoreToStars(this.score, completed);
    const result: B4FocusFlightResult = {
      score: this.score,
      flames: this.flameCounts,
      bestCombo: this.bestCombo,
      stars,
      completed,
      levelName: LEVEL_NAME,
      objectiveText: LEVEL_OBJECTIVE,
      sparkCollected: this.flameCounts.spark,
      sparkGoal: LEVEL_SPARK_GOAL,
      objectiveComplete: completed,
      timedOut: !completed && this.hearts > 0 && this.getTimeLeft() <= 0,
      missionText: completed
        ? 'B-4 collected enough Spark Flames to finish Spark Run.'
        : 'B-4 needs one more steady flight to collect the Spark Flames.',
    };
    this.scene.start('ResultsScene', { result });
  }

  private restartMission(): void {
    this.playAudioHook('button');
    this.stopAmbientAudio();
    this.scene.restart();
  }

  private togglePause(): void {
    if (this.gameOver || !this.gameStarted) return;
    this.playAudioHook('button');
    const isPaused = this.scene.isPaused('GameScene');
    if (isPaused) {
      this.scene.resume('GameScene');
      this.resumeAmbientAudio();
    } else {
      this.scene.pause('GameScene');
      this.pauseAmbientAudio();
    }
    this.emitHud(!isPaused);
  }

  private toggleMute(): void {
    const nextMuted = !this.muted;
    if (!nextMuted) {
      this.muted = false;
      writeMutedPreference(false);
      this.resumeAmbientAudio();
      this.playAudioHook('button');
    } else {
      this.playAudioHook('button');
      this.muted = true;
      writeMutedPreference(true);
      this.pauseAmbientAudio();
    }
    this.emitHud();
  }

  private getTimeLeft(): number {
    return Math.max(0, LEVEL_MAX_SECONDS - Math.floor(this.elapsedMs / 1000));
  }

  private emitHud(paused = false): void {
    const hud: B4FocusFlightHudState = {
      score: this.score,
      hearts: this.hearts,
      timeLeft: this.getTimeLeft(),
      combo: this.combo,
      levelName: LEVEL_NAME,
      objectiveText: LEVEL_OBJECTIVE,
      sparkCollected: Math.min(this.flameCounts.spark, LEVEL_SPARK_GOAL),
      sparkGoal: LEVEL_SPARK_GOAL,
      muted: this.muted,
      paused,
    };
    this.game.events.emit(B4_FOCUS_FLIGHT_EVENTS.hud, hud);
  }

  private playAudioHook(name: string): void {
    if (this.muted) return;
    if (name === 'button') {
      this.buttonSound?.play();
      return;
    }
    if (name === 'mission complete') {
      this.successSound?.play();
    }
  }

  private startAmbientAudio(): void {
    if (this.muted || !this.ambientSound) return;
    if (this.ambientSound.isPlaying) return;
    this.ambientSound.play();
  }

  private pauseAmbientAudio(): void {
    if (this.ambientSound?.isPlaying) {
      this.ambientSound.pause();
    }
  }

  private resumeAmbientAudio(): void {
    if (this.muted || !this.ambientSound || this.gameOver || !this.gameStarted) return;
    if (this.ambientSound.isPaused) {
      this.ambientSound.resume();
    } else if (!this.ambientSound.isPlaying) {
      this.ambientSound.play();
    }
  }

  private stopAmbientAudio(): void {
    if (this.ambientSound?.isPlaying || this.ambientSound?.isPaused) {
      this.ambientSound.stop();
    }
  }

  private prepareProductionTextures(): void {
    this.createTransparentBorderTexture(B4_ASSET_KEYS.sparkFlame, B4_PROCESSED_ASSET_KEYS.sparkFlame, 'Sparkle Flame');
    this.createTransparentBorderTexture(B4_ASSET_KEYS.anchorFlame, B4_PROCESSED_ASSET_KEYS.anchorFlame, 'Anchor Flame');
    this.createTransparentBorderTexture(B4_ASSET_KEYS.emberFlame, B4_PROCESSED_ASSET_KEYS.emberFlame, 'Ember Flame');
    this.createTransparentBorderTexture(B4_ASSET_KEYS.cloudObstacle, B4_PROCESSED_ASSET_KEYS.cloudObstacle, 'Cloud obstacle');
    this.createTransparentBorderTexture(B4_ASSET_KEYS.logObstacle, B4_PROCESSED_ASSET_KEYS.logObstacle, 'Log obstacle');
    B4_BACKGROUND_LAYER_SOURCES.forEach((layer) => {
      if (this.textures.exists(layer.key)) {
        this.createTransparentCheckerTexture(layer.key, this.getPreparedBackgroundLayerKey(layer.key), layer.label);
      }
    });
  }

  private getPreparedBackgroundLayerKey(key: string): string {
    return `${key}-clean`;
  }

  private getRenderableBackgroundLayerKey(key: string): string {
    const preparedKey = this.getPreparedBackgroundLayerKey(key);
    return this.textures.exists(preparedKey) ? preparedKey : key;
  }

  private createTransparentBorderTexture(sourceKey: string, targetKey: string, label: string): void {
    if (this.textures.exists(targetKey)) {
      this.textures.remove(targetKey);
    }
    if (!this.textures.exists(sourceKey)) {
      console.warn(`[B-4 Focus Flight] Missing optional asset: ${label}`);
      return;
    }

    const source = this.textures.get(sourceKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const width = source.width;
    const height = source.height;
    if (!width || !height) {
      console.warn(`[B-4 Focus Flight] Optional asset could not be prepared: ${label}`);
      return;
    }

    const scratch = document.createElement('canvas');
    scratch.width = width;
    scratch.height = height;
    const context = scratch.getContext('2d');
    if (!context) return;
    context.drawImage(source, 0, 0);
    const imageData = context.getImageData(0, 0, width, height);
    this.clearBorderConnectedWhite(imageData.data, width, height);
    const bounds = this.getAlphaBounds(imageData.data, width, height, 8);
    if (!bounds) {
      console.warn(`[B-4 Focus Flight] Optional asset had no visible pixels: ${label}`);
      return;
    }

    context.putImageData(imageData, 0, 0);
    const padding = 12;
    const cropX = Math.max(0, bounds.x - padding);
    const cropY = Math.max(0, bounds.y - padding);
    const cropRight = Math.min(width, bounds.right + padding);
    const cropBottom = Math.min(height, bounds.bottom + padding);
    const cropWidth = cropRight - cropX;
    const cropHeight = cropBottom - cropY;

    const texture = this.textures.createCanvas(targetKey, cropWidth, cropHeight);
    const canvas = texture?.getSourceImage() as HTMLCanvasElement | undefined;
    const targetContext = canvas?.getContext('2d');
    if (!texture || !canvas || !targetContext) {
      console.warn(`[B-4 Focus Flight] Optional asset could not be prepared: ${label}`);
      return;
    }

    targetContext.imageSmoothingEnabled = true;
    targetContext.imageSmoothingQuality = 'high';
    targetContext.drawImage(scratch, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    texture.refresh();
  }

  private createTransparentCheckerTexture(sourceKey: string, targetKey: string, label: string): void {
    if (this.textures.exists(targetKey)) {
      this.textures.remove(targetKey);
    }
    const source = this.textures.get(sourceKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined;
    if (!source?.width || !source.height) return;

    const scratch = document.createElement('canvas');
    scratch.width = source.width;
    scratch.height = source.height;
    const context = scratch.getContext('2d');
    if (!context) return;
    context.drawImage(source, 0, 0);
    const imageData = context.getImageData(0, 0, scratch.width, scratch.height);
    const data = imageData.data;
    let cleared = 0;

    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      const highNeutral = red > 222 && green > 222 && blue > 222 && Math.max(red, green, blue) - Math.min(red, green, blue) < 18;
      if (highNeutral) {
        data[i + 3] = 0;
        cleared += 1;
      }
    }

    if (cleared === 0) return;
    context.putImageData(imageData, 0, 0);
    const texture = this.textures.createCanvas(targetKey, scratch.width, scratch.height);
    const canvas = texture?.getSourceImage() as HTMLCanvasElement | undefined;
    const targetContext = canvas?.getContext('2d');
    if (!texture || !canvas || !targetContext) {
      console.warn(`[B-4 Focus Flight] Optional background layer could not be prepared: ${label}`);
      return;
    }
    targetContext.imageSmoothingEnabled = true;
    targetContext.imageSmoothingQuality = 'high';
    targetContext.drawImage(scratch, 0, 0);
    texture.refresh();
  }

  private clearBorderConnectedWhite(data: Uint8ClampedArray, width: number, height: number): void {
    const visited = new Uint8Array(width * height);
    const queue: number[] = [];
    const enqueue = (x: number, y: number): void => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const index = y * width + x;
      if (visited[index]) return;
      const offset = index * 4;
      if (data[offset] < 245 || data[offset + 1] < 245 || data[offset + 2] < 245) return;
      visited[index] = 1;
      queue.push(index);
    };

    for (let x = 0; x < width; x += 1) {
      enqueue(x, 0);
      enqueue(x, height - 1);
    }
    for (let y = 0; y < height; y += 1) {
      enqueue(0, y);
      enqueue(width - 1, y);
    }

    let head = 0;
    while (head < queue.length) {
      const index = queue[head];
      head += 1;
      data[index * 4 + 3] = 0;
      const x = index % width;
      const y = Math.floor(index / width);
      enqueue(x + 1, y);
      enqueue(x - 1, y);
      enqueue(x, y + 1);
      enqueue(x, y - 1);
    }
  }

  private hasUsableTexture(key: string): boolean {
    return this.textures.exists(key);
  }

  private getAlphaBounds(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    alphaThreshold: number,
  ): { x: number; y: number; right: number; bottom: number } | null {
    let x = width;
    let y = height;
    let right = 0;
    let bottom = 0;

    for (let py = 0; py < height; py += 1) {
      for (let px = 0; px < width; px += 1) {
        const alpha = data[(py * width + px) * 4 + 3];
        if (alpha <= alphaThreshold) continue;
        x = Math.min(x, px);
        y = Math.min(y, py);
        right = Math.max(right, px + 1);
        bottom = Math.max(bottom, py + 1);
      }
    }

    if (right <= x || bottom <= y) return null;
    return { x, y, right, bottom };
  }

  private scheduleNextBlink(): void {
    if (!this.playerSprite || this.gameOver) return;
    this.blinkTimer?.remove(false);
    this.blinkTimer = this.time.delayedCall(Phaser.Math.Between(1800, 3200), () => {
      if (this.playerSprite && !this.invincible && this.b4StateMachine?.state === 'idle') {
        this.playBlinkSequence();
      }
      this.scheduleNextBlink();
    });
  }

  private playBlinkSequence(): void {
    this.showB4Expression('blinking', Phaser.Math.Between(105, 155));
  }

  private showB4Expression(expression: B4StateKey, durationMs?: number): void {
    if (!this.playerSprite || !this.b4StateMachine) return;
    if (expression === 'blinking' && this.invincible) return;
    if (expression === 'happy' && this.invincible) return;
    this.b4StateMachine.request(expression, durationMs);
  }

  private applyB4StateTexture(state: B4StateKey): void {
    const textureKey = getB4TextureKey(this.b4Variant, state);
    if (this.playerSprite && this.hasUsableTexture(textureKey)) this.playerSprite.setTexture(textureKey);
  }
}
