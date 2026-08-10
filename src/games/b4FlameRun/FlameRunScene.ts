import Phaser from 'phaser';
import { addDistance, collectFlame, createFlameRunState, isRunOver, loseCourage, scrollSpeedFor, type FlameRunState } from './state';
import { FLAME_RUN_EVENTS, type FlameRunHud, type FlameRunResult } from './types';

const WIDTH = 1200;
const HEIGHT = 675;
const FLOOR_Y = 548;
const PLAYER_WIDTH = 108;
const PLAYER_HEIGHT = 60;
const SLIDE_WIDTH = 116;
const SLIDE_HEIGHT = 40;
const JUMP_DURATION = 760;
const FOCUS_LEAP_DURATION = 980;
const FOCUS_LEAP_HOLD_MS = 300;
const FOCUS_LEAP_THRUST = 980;
const MILESTONE_SECONDS = 100;
const PLATFORM_TOP = { low: FLOOR_Y - 72, medium: FLOOR_Y - 126, high: FLOOR_Y - 182 } as const;
const BEST_SCORE_KEY = 'b4-flame-run:best-score';

type MovingBody = Phaser.Physics.Arcade.Image & { kind?: string };
type Zone = 1 | 2 | 3;
type PlatformConfig = { x: number; top: number; width: number; gold?: boolean; moving?: 'vertical' | 'horizontal' };
type ChunkName = 'forest-arc' | 'step-up' | 'step-down' | 'upper-bonus' | 'platform-gap' | 'leap-slide' | 'staircase' | 'long-runway';

export default class FlameRunScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private ground!: Phaser.GameObjects.TileSprite;
  private foreground!: Phaser.GameObjects.TileSprite;
  private aura!: Phaser.GameObjects.Arc;
  private groundShadow!: Phaser.GameObjects.Ellipse;
  private layers: { sprite: Phaser.GameObjects.TileSprite; factor: number }[] = [];
  private obstacles!: Phaser.Physics.Arcade.Group;
  private flames!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.Group;
  private zoneBackground!: Phaser.GameObjects.Image;
  private zoneTint!: Phaser.GameObjects.Rectangle;
  private zone: Zone = 1;
  private supportY = FLOOR_Y;
  private milestoneShown = false;
  private jumpHeld = false;
  private jumpActive = false;
  private jumpStartedAt = 0;
  private jumpRotation = 0;
  private focusLeapActive = false;
  private tutorialStage = 0;
  private state: FlameRunState = createFlameRunState();
  private started = false;
  private ended = false;
  private sliding = false;
  private paused = false;
  private wasGrounded = true;
  private focusWasActive = false;
  private lastTrailAt = 0;
  private invulnerableUntil = 0;
  private startedAt = 0;
  private lastTick = 0;
  private lastSpawn = 0;
  private lastHud = 0;
  private nextPattern = 0;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  private downKey!: Phaser.Input.Keyboard.Key;

  constructor() { super('B4FlameRun'); }

  preload(): void {
    this.load.image('run-b4', '/images/B-4FlightGame/Idle/Idle@2x-transparent.png');
    this.load.image('run-flame', '/images/icons/FocusFlameIcon/focus-flame-transparent.png');
    this.load.image('run-cloud', '/images/B-4FlightGame/Clouds/Cloud@2x.png');
    this.load.image('run-base', '/images/B-4FlightGame/background/GameplayBackgrounds.webp');
    this.load.image('run-sky', '/images/B-4FlightGame/background/layers/sky.png');
    this.load.image('run-mountains-far', '/images/B-4FlightGame/background/layers/mountains_far.png');
    this.load.image('run-mountains-mid', '/images/B-4FlightGame/background/layers/mountains_mid.png');
    this.load.image('run-trees-far', '/images/B-4FlightGame/background/layers/trees_far.png');
    this.load.image('run-trees-mid', '/images/B-4FlightGame/background/layers/trees_mid.png');
    this.load.image('run-fog', '/images/B-4FlightGame/background/layers/fog.png');
    this.load.image('run-leaves', '/images/B-4FlightGame/background/layers/forground_leaves.png');
    this.load.image('run-caverns', '/images/characters/thecave_block_image.webp');
    this.load.image('run-dragon-nest', '/images/focus-flame-lab/theceremony_block_image.webp');
    this.load.audio('run-pickup', '/audio/b4/flame-tap-1.mp3');
    this.load.audio('run-start-sfx', '/audio/b4/flame-start.mp3');
    this.load.audio('run-hit', '/audio/b4/b4-pause.mp3');
    this.load.audio('run-focus', '/audio/b4/reward.mp3');
  }

  create(): void {
    this.createWorld();
    this.createGameplayTextures();
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.flames = this.physics.add.group({ allowGravity: false, immovable: true });
    this.platforms = this.physics.add.group({ allowGravity: false, immovable: true });
    this.groundShadow = this.add.ellipse(300, FLOOR_Y + 4, 82, 18, 0x020914, .3).setDepth(13);
    this.player = this.physics.add.sprite(300, FLOOR_Y - PLAYER_HEIGHT / 2, 'run-b4').setOrigin(.5).setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT).setDepth(15);
    this.player.setCollideWorldBounds(true).setGravityY(1550);
    this.setPlayerBodyWorld(82, 42, 13, 14);
    this.aura = this.add.circle(this.player.x, this.player.y, 50, 0xffd65a, 0).setDepth(14).setBlendMode(Phaser.BlendModes.ADD);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms, undefined, (_player, platform) => this.canLandOnPlatform(platform as MovingBody), this);
    this.physics.add.overlap(this.player, this.flames, (_player, flame) => this.collect(flame as MovingBody));
    this.physics.add.overlap(this.player, this.obstacles, (_player, obstacle) => this.hit(obstacle as MovingBody));

    this.jumpKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) as Phaser.Input.Keyboard.Key;
    this.downKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN) as Phaser.Input.Keyboard.Key;
    const upKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP) as Phaser.Input.Keyboard.Key;
    const wKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
    const sKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
    upKey.on('down', this.jump, this).on('up', this.releaseJump, this);
    wKey.on('down', this.jump, this).on('up', this.releaseJump, this);
    sKey.on('down', this.slide, this);
    this.jumpKey.on('down', this.jump, this);
    this.jumpKey.on('up', this.releaseJump, this);
    this.downKey.on('down', this.slide, this);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', this.togglePause, this);
    this.game.events.on(FLAME_RUN_EVENTS.start, this.startRun, this);
    this.game.events.on(FLAME_RUN_EVENTS.jump, this.jump, this);
    this.game.events.on(FLAME_RUN_EVENTS.jumpEnd, this.releaseJump, this);
    this.game.events.on(FLAME_RUN_EVENTS.slide, this.slide, this);
    this.game.events.on(FLAME_RUN_EVENTS.pause, this.pauseRun, this);
    this.game.events.on(FLAME_RUN_EVENTS.resume, this.resumeRun, this);
    this.game.events.on(FLAME_RUN_EVENTS.restart, this.restart, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      Object.values(FLAME_RUN_EVENTS).forEach((event) => this.game.events.removeAllListeners(event));
    });
    this.emitHud('B-4: Ready to run!');
    this.game.events.emit(FLAME_RUN_EVENTS.ready);
  }

  update(time: number, delta: number): void {
    if (!this.started || this.ended || this.paused) return;
    const elapsed = (time - this.startedAt) / 1000;
    const speed = scrollSpeedFor(elapsed);
    const nextZone: Zone = elapsed >= 65 ? 3 : elapsed >= 30 ? 2 : 1;
    if (nextZone !== this.zone) this.transitionZone(nextZone);
    this.layers.forEach(({ sprite, factor }) => { sprite.tilePositionX += speed * factor * delta / 1000; });
    this.ground.tilePositionX += speed * delta / 1000;
    this.foreground.tilePositionX += speed * 1.18 * delta / 1000;
    [...this.obstacles.getChildren(), ...this.flames.getChildren(), ...this.platforms.getChildren()].forEach((child) => {
      const body = child as MovingBody;
      body.x -= speed * delta / 1000;
      if (body.kind === 'platform') {
        const movement = body.getData('movement') as PlatformConfig['moving'];
        const phase = Math.sin((time + body.getData('phase')) / 850);
        if (movement === 'vertical') body.y = body.getData('baseY') + phase * 28;
        if (movement === 'horizontal') {
          const previousOffset = Number(body.getData('lastOffset') ?? 0);
          const nextOffset = phase * 34;
          body.x += nextOffset - previousOffset;
          body.setData('lastOffset', nextOffset);
        }
      }
      body.body?.updateFromGameObject();
      if (body.x < -360) body.destroy();
    });
    const grounded = Boolean(this.player.body?.blocked.down || this.player.body?.touching.down);
    if (grounded) this.supportY = this.findSupportingSurfaceY();
    if (grounded && !this.wasGrounded) this.land();
    if (grounded) {
      this.player.y = this.supportY - (this.sliding ? SLIDE_HEIGHT : PLAYER_HEIGHT) / 2;
      if (!this.sliding) this.player.setAngle(0);
    } else if (this.jumpActive) {
      const heldFor = time - this.jumpStartedAt;
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (this.jumpHeld && heldFor <= FOCUS_LEAP_HOLD_MS && body.velocity.y < 0) {
        const focusStrength = this.state.focusModeUntil > time ? 1.1 : 1;
        body.setVelocityY(body.velocity.y - FOCUS_LEAP_THRUST * focusStrength * delta / 1000);
        if (heldFor > 90) this.engageFocusLeap();
      }
      const rotationDuration = this.focusLeapActive ? FOCUS_LEAP_DURATION : JUMP_DURATION;
      this.jumpRotation = Math.min(360, this.jumpRotation + 360 * delta / rotationDuration);
      this.player.setAngle(this.jumpRotation);
    }
    this.wasGrounded = grounded;
    this.aura.setPosition(this.player.x, this.player.y);
    const altitude = Phaser.Math.Clamp((this.supportY - (this.player.y + this.player.displayHeight / 2)) / 112, 0, 1);
    this.groundShadow.setPosition(this.player.x, this.supportY + 4).setScale(1 - altitude * .34, 1 - altitude * .18).setAlpha(.3 - altitude * .18);
    if (time - this.lastSpawn > Math.max(1050, 1900 - speed)) {
      this.spawnPattern();
      this.lastSpawn = time;
    }
    if (time - this.lastTick > 250) {
      this.state = addDistance(this.state, speed * .25 / 10);
      this.lastTick = time;
    }
    const focusMode = this.state.focusModeUntil > time;
    if (focusMode !== this.focusWasActive) this.transitionFocusMode(focusMode);
    this.focusWasActive = focusMode;
    if (time - this.lastTrailAt > (focusMode || this.focusLeapActive ? 55 : this.sliding ? 70 : 190)) {
      this.addThrusterTrail(focusMode || this.focusLeapActive ? 'focus' : this.sliding ? 'slide' : 'run');
      this.lastTrailAt = time;
    }
    if (time - this.lastHud > 100) { this.emitHud(focusMode ? 'B-4: Focus Mode!' : this.messageForStreak()); this.lastHud = time; }
    if (!this.milestoneShown && elapsed >= MILESTONE_SECONDS) this.reachMilestone();
  }

  private createWorld(): void {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x07172b);
    const base = this.add.tileSprite(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 'run-base').setDisplaySize(WIDTH, HEIGHT).setDepth(0);
    this.layers.push({ sprite: base, factor: .025 });
    this.zoneBackground = this.add.image(WIDTH / 2, HEIGHT / 2, 'run-base').setDisplaySize(WIDTH, HEIGHT).setDepth(1).setAlpha(0);
    this.zoneTint = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x07172b, 0).setDepth(7);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x06172c, .2).setDepth(8);
    this.createTerrainTextures();
    this.ground = this.add.tileSprite(WIDTH / 2, FLOOR_Y + 64, WIDTH, 128, 'run-ground').setDepth(10);
    this.physics.add.existing(this.ground, true);
    this.foreground = this.add.tileSprite(WIDTH / 2, FLOOR_Y + 116, WIDTH, 92, 'run-foreground').setDepth(18).setAlpha(.88);
  }

  private createTerrainTextures(): void {
    if (!this.textures.exists('run-ground')) {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(0x102538).fillRect(0, 0, 360, 128);
      graphics.fillStyle(0x35506a).fillRect(0, 0, 360, 9);
      graphics.fillStyle(0x6ecfe2, .38).fillRect(0, 9, 360, 4);
      for (let x = -25; x < 380; x += 72) {
        graphics.fillStyle(x % 144 === 0 ? 0x1a354b : 0x172f44).fillRoundedRect(x, 18, 66, 46, 10);
        graphics.lineStyle(2, 0x29485e, .8).strokeRoundedRect(x, 18, 66, 46, 10);
        graphics.fillStyle(0x0b1c2d).fillTriangle(x + 10, 75, x + 44, 58, x + 70, 92);
      }
      graphics.generateTexture('run-ground', 360, 128).destroy();
    }
    if (!this.textures.exists('run-foreground')) {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(0x061321, .96).fillRect(0, 38, 360, 54);
      for (let x = 0; x < 360; x += 44) {
        graphics.fillStyle(x % 88 === 0 ? 0x173a45 : 0x0d2a36).fillTriangle(x, 55, x + 13, 10 + (x % 3) * 6, x + 24, 55);
        graphics.fillStyle(0x24516a, .8).fillCircle(x + 30, 48, 12);
      }
      graphics.generateTexture('run-foreground', 360, 92).destroy();
    }
  }

  private createGameplayTextures(): void {
    if (!this.textures.exists('run-platform')) {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(0x172f44).fillRoundedRect(0, 0, 360, 54, 8);
      graphics.fillStyle(0x6ecfe2, .72).fillRoundedRect(0, 0, 360, 8, 5);
      graphics.lineStyle(2, 0x355f78, .9).strokeRoundedRect(1, 1, 358, 52, 8);
      for (let x = 18; x < 350; x += 52) graphics.fillStyle(0x0c2133, .85).fillTriangle(x, 45, x + 18, 20, x + 36, 45);
      graphics.generateTexture('run-platform', 360, 54).destroy();
    }
    if (!this.textures.exists('run-log-clean')) {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(0x51351f).fillRoundedRect(3, 9, 90, 34, 16);
      graphics.fillStyle(0x9a6538).fillEllipse(84, 26, 22, 34);
      graphics.lineStyle(3, 0xd59a55, .75).strokeEllipse(84, 26, 12, 22);
      graphics.lineStyle(3, 0x2d251b, .9).lineBetween(16, 13, 65, 39);
      graphics.generateTexture('run-log-clean', 96, 52).destroy();
    }
    if (!this.textures.exists('run-crystal-clean')) {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(0x58cbea, .92).fillTriangle(0, 64, 19, 5, 34, 64);
      graphics.fillStyle(0xb7f2ff, .9).fillTriangle(15, 64, 30, 18, 48, 64);
      graphics.lineStyle(2, 0xe8fbff, .85).lineBetween(19, 5, 15, 64);
      graphics.generateTexture('run-crystal-clean', 50, 66).destroy();
    }
    if (!this.textures.exists('run-root-clean')) {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.lineStyle(13, 0x563922, 1).lineBetween(2, 42, 30, 10).lineBetween(30, 10, 60, 30).lineBetween(60, 30, 84, 44).lineBetween(84, 44, 112, 10);
      graphics.lineStyle(4, 0xb17a40, .7).lineBetween(2, 38, 30, 7).lineBetween(30, 7, 60, 26).lineBetween(60, 26, 84, 40).lineBetween(84, 40, 112, 8);
      graphics.generateTexture('run-root-clean', 116, 52).destroy();
    }
    if (!this.textures.exists('run-energy-hazard')) {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(0xffa93a, .88).fillTriangle(0, 62, 18, 8, 34, 62).fillTriangle(25, 62, 44, 2, 62, 62);
      graphics.lineStyle(3, 0xffe279, .95).lineBetween(18, 8, 0, 62).lineBetween(44, 2, 62, 62);
      graphics.generateTexture('run-energy-hazard', 64, 64).destroy();
    }
  }

  private startRun(): void {
    if (this.started) return;
    this.started = true;
    this.startedAt = this.time.now;
    this.lastSpawn = this.time.now - 900;
    this.sound.play('run-start-sfx', { volume: .3 });
    this.tutorialStage = 0;
  }

  private jump(): void {
    if (!this.started || this.ended) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down || body.touching.down) {
      this.endSlide();
      this.tweens.killTweensOf(this.player);
      this.player.setAngle(0).setDisplaySize(PLAYER_WIDTH * 1.06, PLAYER_HEIGHT * .94);
      this.tweens.add({ targets: this.player, displayWidth: PLAYER_WIDTH, displayHeight: PLAYER_HEIGHT, duration: 105, ease: 'Quad.Out' });
      this.player.setVelocityY(-590);
      this.jumpHeld = true;
      this.jumpActive = true;
      this.focusLeapActive = false;
      this.jumpStartedAt = this.time.now;
      this.jumpRotation = 0;
      if (this.tutorialStage === 0) {
        this.tutorialStage = 1;
        this.time.delayedCall(1800, () => { if (this.tutorialStage === 1) this.tutorialStage = 2; });
      }
    }
  }

  private releaseJump(): void { this.jumpHeld = false; }

  private engageFocusLeap(): void {
    if (this.focusLeapActive) return;
    this.focusLeapActive = true;
    if (this.tutorialStage <= 2) this.tutorialStage = 3;
    for (let index = 0; index < 3; index += 1) this.addThrusterTrail('focus');
  }

  private slide(): void {
    if (!this.started || this.ended || this.sliding) return;
    this.sliding = true;
    this.tweens.killTweensOf(this.player);
    this.player.setY(this.supportY - SLIDE_HEIGHT / 2).setAngle(11).setDisplaySize(SLIDE_WIDTH, SLIDE_HEIGHT);
    this.tweens.add({ targets: this.player, x: 310, duration: 120, ease: 'Quad.Out' });
    this.setPlayerBodyWorld(92, 28, 12, 10);
    this.time.delayedCall(760, () => this.endSlide());
  }

  private endSlide(): void {
    if (!this.sliding) return;
    this.sliding = false;
    this.player.setY(this.supportY - PLAYER_HEIGHT / 2).setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT).setAngle(0);
    this.tweens.add({ targets: this.player, x: 300, duration: 150, ease: 'Quad.Out' });
    this.setPlayerBodyWorld(82, 42, 13, 14);
  }

  private setPlayerBodyWorld(width: number, height: number, offsetX: number, offsetY: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(width / this.player.scaleX, height / this.player.scaleY)
      .setOffset(offsetX / this.player.scaleX, offsetY / this.player.scaleY);
  }

  private spawnPattern(): void {
    const pools: Record<Zone, ChunkName[]> = {
      1: ['step-up', 'forest-arc', 'platform-gap', 'long-runway'],
      2: ['step-up', 'step-down', 'upper-bonus', 'staircase', 'platform-gap'],
      3: ['upper-bonus', 'leap-slide', 'staircase', 'long-runway', 'step-down'],
    };
    const pool = pools[this.zone];
    this.spawnAuthoredChunk(pool[this.nextPattern++ % pool.length]);
  }

  private spawnAuthoredChunk(chunk: ChunkName): void {
    if (chunk === 'forest-arc') {
      this.spawnObstacle('log', FLOOR_Y - 24, 72, 48);
      this.spawnFlameArc(FLOOR_Y - 92);
      return;
    }
    if (chunk === 'step-up') this.spawnPlatformSequence([
      { x: WIDTH + 150, top: PLATFORM_TOP.low, width: 170 },
      { x: WIDTH + 380, top: PLATFORM_TOP.medium, width: 180 },
      { x: WIDTH + 625, top: PLATFORM_TOP.high, width: 210 },
    ], true);
    if (chunk === 'step-down') this.spawnPlatformSequence([
      { x: WIDTH + 170, top: PLATFORM_TOP.high, width: 220 },
      { x: WIDTH + 430, top: PLATFORM_TOP.medium, width: 190 },
      { x: WIDTH + 665, top: PLATFORM_TOP.low, width: 180 },
    ], true);
    if (chunk === 'upper-bonus') this.spawnPlatformSequence([
      { x: WIDTH + 230, top: PLATFORM_TOP.medium, width: 340, gold: this.zone === 3 },
      { x: WIDTH + 590, top: PLATFORM_TOP.high, width: 280, gold: this.zone === 3 },
    ], true, 2);
    if (chunk === 'platform-gap') this.spawnPlatformSequence([
      { x: WIDTH + 150, top: PLATFORM_TOP.low, width: 180 },
      { x: WIDTH + 410, top: PLATFORM_TOP.low, width: 190 },
    ], false);
    if (chunk === 'leap-slide') {
      const configs: PlatformConfig[] = [{ x: WIDTH + 260, top: PLATFORM_TOP.medium, width: 420, gold: true }];
      this.spawnPlatformSequence(configs, true, 2);
      this.spawnObstacle('root', PLATFORM_TOP.medium - 58, 112, 44, WIDTH + 345);
    }
    if (chunk === 'staircase') this.spawnPlatformSequence([
      { x: WIDTH + 125, top: PLATFORM_TOP.low, width: 145 },
      { x: WIDTH + 325, top: PLATFORM_TOP.medium, width: 150, moving: this.zone === 2 ? 'vertical' : undefined },
      { x: WIDTH + 535, top: PLATFORM_TOP.high, width: 170, gold: this.zone === 3 },
    ], true);
    if (chunk === 'long-runway') {
      const configs: PlatformConfig[] = [{ x: WIDTH + 260, top: PLATFORM_TOP.low, width: 430, moving: this.zone === 2 ? 'horizontal' : undefined }];
      this.spawnPlatformSequence(configs, false);
      this.spawnObstacle(this.zone === 1 ? 'log' : 'crystal', PLATFORM_TOP.low - 25, 48, 50, WIDTH + 350);
    }
  }

  private spawnObstacle(kind: string, y: number, width: number, height: number, x = WIDTH + 120): void {
    const texture = kind === 'crystal' ? 'run-crystal-clean' : kind === 'root' ? 'run-root-clean' : kind === 'energy' ? 'run-energy-hazard' : 'run-log-clean';
    const obstacle = this.obstacles.create(x, y, texture) as MovingBody;
    obstacle.kind = kind;
    obstacle.setDisplaySize(width, height).setDepth(13);
    if (kind === 'root') obstacle.setAngle(180);
    (obstacle.body as Phaser.Physics.Arcade.Body).setSize(width * .75, height * .7);
  }

  private spawnPlatformSequence(configs: PlatformConfig[], highRoute = false, rewardMultiplier = 1): void {
    if (!this.isPlatformSequenceSafe(configs)) return;
    configs.forEach((config, index) => {
      const platform = this.platforms.create(config.x, config.top + 27, 'run-platform') as MovingBody;
      platform.kind = 'platform';
      platform.setDisplaySize(config.width, 54).setDepth(12);
      if (config.gold) platform.setTint(0xffc84d);
      const body = platform.body as Phaser.Physics.Arcade.Body;
      body.setSize(config.width / platform.scaleX, 12 / platform.scaleY).setOffset(0, 0);
      platform.setData({ movement: config.moving, baseY: platform.y, phase: index * 430, lastOffset: 0 });
      const flameY = config.top - 45;
      const flameCount = Math.max(2, Math.floor(config.width / 90)) * rewardMultiplier;
      for (let flameIndex = 0; flameIndex < flameCount; flameIndex += 1) {
        this.spawnFlame(config.x - config.width / 2 + 45 + flameIndex * 70, flameY - (index % 2) * 18);
      }
    });
    if (highRoute) {
      for (let index = 0; index < 3; index += 1) this.spawnFlame(WIDTH + 90 + index * 110, FLOOR_Y - 34);
    }
  }

  private isPlatformSequenceSafe(configs: PlatformConfig[]): boolean {
    return configs.every((config, index) => {
      if (config.width < 140 || config.top < PLATFORM_TOP.high - 8 || config.top > PLATFORM_TOP.low + 8) return false;
      if (index === 0) return FLOOR_Y - config.top <= 190;
      const previous = configs[index - 1];
      const horizontalGap = config.x - config.width / 2 - (previous.x + previous.width / 2);
      const rise = previous.top - config.top;
      return horizontalGap <= 130 && rise <= 112;
    });
  }

  private canLandOnPlatform(platform: MovingBody): boolean {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const platformTop = platform.getBounds().top;
    return body.velocity.y >= 0 && this.player.getBounds().bottom <= platformTop + 16;
  }

  private findSupportingSurfaceY(): number {
    const playerBounds = this.player.getBounds();
    let surface = FLOOR_Y;
    this.platforms.getChildren().forEach((child) => {
      const platform = child as MovingBody;
      const bounds = platform.getBounds();
      const horizontallyAligned = playerBounds.right > bounds.left + 8 && playerBounds.left < bounds.right - 8;
      if (horizontallyAligned && Math.abs(playerBounds.bottom - bounds.top) < 24) surface = Math.min(surface, bounds.top);
    });
    return surface;
  }

  private transitionZone(zone: Zone): void {
    this.zone = zone;
    const texture = zone === 2 ? 'run-caverns' : 'run-dragon-nest';
    const tint = zone === 2 ? 0x24164d : 0x5a2c12;
    const incoming = this.add.image(WIDTH / 2, HEIGHT / 2, texture).setDisplaySize(WIDTH, HEIGHT).setDepth(2).setAlpha(0);
    this.tweens.add({ targets: incoming, alpha: .72, duration: 1600, ease: 'Sine.InOut', onComplete: () => {
      this.zoneBackground.setTexture(texture).setDisplaySize(WIDTH, HEIGHT).setAlpha(.72);
      incoming.destroy();
    } });
    this.tweens.add({ targets: this.zoneTint, fillColor: tint, alpha: zone === 2 ? .28 : .22, duration: 1600 });
    const label = this.add.text(WIDTH / 2, 112, zone === 2 ? 'FOCUS CAVERNS' : 'DRAGON NEST APPROACH', {
      fontFamily: 'Arial', fontSize: '28px', fontStyle: 'bold', color: '#ffe27f', letterSpacing: 4,
    }).setOrigin(.5).setDepth(22).setAlpha(0);
    this.tweens.add({ targets: label, alpha: 1, yoyo: true, hold: 900, duration: 450, onComplete: () => label.destroy() });
  }

  private reachMilestone(): void {
    this.milestoneShown = true;
    this.state = { ...this.state, score: this.state.score + 1000 };
    const label = this.add.text(WIDTH / 2, 160, 'DRAGON NEST REACHED', {
      fontFamily: 'Arial', fontSize: '32px', fontStyle: 'bold', color: '#ffe27f', stroke: '#07172b', strokeThickness: 6,
    }).setOrigin(.5).setDepth(24);
    this.burst(this.player.x, this.player.y);
    this.tweens.add({ targets: label, alpha: 0, y: 135, delay: 1200, duration: 600, onComplete: () => label.destroy() });
  }

  private spawnFlameLine(y: number): void { for (let i = 0; i < 5; i += 1) this.spawnFlame(WIDTH + 130 + i * 72, y); }
  private spawnFlameArc(baseY: number): void { [0, -48, -72, -48, 0].forEach((offset, i) => this.spawnFlame(WIDTH + 130 + i * 72, baseY + offset)); }
  private spawnFlameZigzag(): void { [0, -70, 0, -70, 0].forEach((offset, i) => this.spawnFlame(WIDTH + 130 + i * 72, FLOOR_Y - 80 + offset)); }

  private spawnFlame(x: number, y: number): void {
    const flame = this.flames.create(x, y, 'run-flame') as MovingBody;
    flame.setDisplaySize(42, 54).setDepth(14);
    this.tweens.add({ targets: flame, y: y - 7, alpha: .78, duration: 520, yoyo: true, repeat: -1 });
  }

  private collect(flame: MovingBody): void {
    if (!flame.active) return;
    const focusBefore = this.state.focusModeUntil > this.time.now;
    flame.disableBody(true, true);
    this.state = collectFlame(this.state, this.time.now);
    this.sound.play('run-pickup', { volume: .22 });
    this.burst(flame.x, flame.y);
    if (!focusBefore && this.state.focusModeUntil > this.time.now) {
      this.sound.play('run-focus', { volume: .3 });
      this.cameras.main.flash(300, 255, 220, 110, false);
    }
  }

  private hit(obstacle: MovingBody): void {
    if (!obstacle.active || this.time.now < this.invulnerableUntil) return;
    this.invulnerableUntil = this.time.now + 1350;
    this.state = loseCourage(this.state);
    this.player.setTint(0xff7a63);
    this.sound.play('run-hit', { volume: .24 });
    this.cameras.main.shake(180, .007);
    this.tweens.add({ targets: this.player, x: 282, alpha: .35, duration: 85, yoyo: true, repeat: 5, onComplete: () => {
      this.player.setX(300).setAlpha(1);
      if (this.state.focusModeUntil > this.time.now) this.player.setTint(0xffc72c); else this.player.clearTint();
    } });
    obstacle.destroy();
    if (isRunOver(this.state)) this.finishRun();
  }

  private finishRun(): void {
    this.ended = true;
    this.player.setVelocity(0);
    const previousBest = Number.parseInt(window.localStorage.getItem(BEST_SCORE_KEY) ?? '0', 10) || 0;
    const bestScore = Math.max(previousBest, this.state.score);
    window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
    const result: FlameRunResult = { score: this.state.score, distance: Math.round(this.state.distance), flames: this.state.flames, bestStreak: this.state.bestStreak, bestScore };
    this.game.events.emit(FLAME_RUN_EVENTS.result, result);
  }

  private restart(): void { this.scene.restart(); }

  private burst(x: number, y: number): void {
    for (let i = 0; i < 6; i += 1) {
      const spark = this.add.image(x, y, 'run-flame').setDisplaySize(14, 18).setDepth(20);
      this.tweens.add({ targets: spark, x: x + Phaser.Math.Between(-55, 55), y: y + Phaser.Math.Between(-55, 55), alpha: 0, duration: 350, onComplete: () => spark.destroy() });
    }
  }

  private addThrusterTrail(mode: 'run' | 'slide' | 'focus'): void {
    const size = mode === 'focus' ? 26 : mode === 'slide' ? 20 : 11;
    const distance = mode === 'focus' ? 130 : mode === 'slide' ? 105 : 48;
    const spark = this.add.image(this.player.x - 52, this.player.y + (this.sliding ? 8 : 13), 'run-flame').setDisplaySize(size, size * 1.3).setDepth(13).setAlpha(mode === 'run' ? .42 : .8).setTint(mode === 'focus' ? 0xffdc57 : 0xffb43b);
    this.tweens.add({ targets: spark, x: spark.x - distance, y: spark.y + Phaser.Math.Between(-7, 7), alpha: 0, duration: mode === 'focus' ? 460 : 320, onComplete: () => spark.destroy() });
  }

  private land(): void {
    this.tweens.killTweensOf(this.player);
    const completedFocusLeap = this.focusLeapActive;
    this.jumpHeld = false;
    this.jumpActive = false;
    this.focusLeapActive = false;
    this.player.angle = 0;
    this.player.setY(this.supportY - PLAYER_HEIGHT * .93 / 2).setDisplaySize(PLAYER_WIDTH * 1.06, PLAYER_HEIGHT * .93);
    this.tweens.add({ targets: this.player, y: this.supportY - PLAYER_HEIGHT / 2, displayWidth: PLAYER_WIDTH, displayHeight: PLAYER_HEIGHT, duration: 130, ease: 'Back.Out' });
    for (let i = 0; i < 4; i += 1) {
      const spark = this.add.image(this.player.x + Phaser.Math.Between(-40, 40), this.supportY - 8, 'run-flame').setDisplaySize(9, 12).setDepth(14).setAlpha(.6);
      this.tweens.add({ targets: spark, y: spark.y - Phaser.Math.Between(12, 28), x: spark.x - Phaser.Math.Between(8, 28), alpha: 0, duration: 240, onComplete: () => spark.destroy() });
    }
    if (completedFocusLeap && this.supportY < FLOOR_Y && this.tutorialStage === 3) {
      this.tutorialStage = 4;
      this.time.delayedCall(1200, () => { if (this.tutorialStage === 4) this.tutorialStage = 5; });
    }
  }

  private transitionFocusMode(active: boolean): void {
    if (active) {
      this.player.setTint(0xffc72c);
      this.aura.setAlpha(0).setScale(.8);
      this.tweens.add({ targets: this.aura, alpha: .34, scale: 1.18, duration: 220, yoyo: true, repeat: -1 });
      this.cameras.main.flash(240, 255, 214, 90, false);
      this.burst(this.player.x, this.player.y);
    } else {
      this.player.clearTint();
      this.tweens.killTweensOf(this.aura);
      this.tweens.add({ targets: this.aura, alpha: 0, scale: .9, duration: 340 });
    }
  }

  private togglePause(): void { if (this.paused) this.resumeRun(); else this.pauseRun(); }
  private pauseRun(): void {
    if (!this.started || this.ended || this.paused) return;
    this.paused = true;
    this.physics.world.pause();
    this.tweens.pauseAll();
    this.time.paused = true;
    this.sound.pauseAll();
    this.game.events.emit(FLAME_RUN_EVENTS.pauseState, true);
  }
  private resumeRun(): void {
    if (!this.paused) return;
    this.paused = false;
    this.physics.world.resume();
    this.tweens.resumeAll();
    this.time.paused = false;
    this.sound.resumeAll();
    this.game.events.emit(FLAME_RUN_EVENTS.pauseState, false);
  }

  private messageForStreak(): string {
    if (this.tutorialStage === 0) return 'TAP TO JUMP';
    if (this.tutorialStage === 1 || this.tutorialStage === 2) return 'HOLD TO LEAP HIGHER';
    if (this.tutorialStage === 3) return 'B-4: Follow the higher flame trail!';
    if (this.tutorialStage === 4) return 'NICE LEAP!';
    if (this.state.streak >= 10) return 'B-4: Focus streak!';
    if (this.state.streak >= 5) return 'B-4: Nice! Keep going!';
    return 'B-4: Jump, slide, and follow the flames!';
  }

  private emitHud(message: string): void {
    const elapsed = this.started ? (this.time.now - this.startedAt) / 1000 : 0;
    const zone = this.zone === 1 ? 'Focus Flame Forest' : this.zone === 2 ? 'Focus Caverns' : 'Dragon Nest Approach';
    const hud: FlameRunHud = { ...this.state, focusMode: this.state.focusModeUntil > this.time.now, message, progress: Math.min(100, Math.round(elapsed / MILESTONE_SECONDS * 100)), zone };
    this.game.events.emit(FLAME_RUN_EVENTS.hud, hud);
  }
}
