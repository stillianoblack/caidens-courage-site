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
const BEST_SCORE_KEY = 'b4-flame-run:best-score';

type MovingBody = Phaser.Physics.Arcade.Image & { kind?: string };

export default class FlameRunScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private ground!: Phaser.GameObjects.TileSprite;
  private foreground!: Phaser.GameObjects.TileSprite;
  private aura!: Phaser.GameObjects.Arc;
  private groundShadow!: Phaser.GameObjects.Ellipse;
  private layers: { sprite: Phaser.GameObjects.TileSprite; factor: number }[] = [];
  private obstacles!: Phaser.Physics.Arcade.Group;
  private flames!: Phaser.Physics.Arcade.Group;
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
    this.load.image('run-b4-hurt', '/images/B-4FlightGame/Hurt/Hurt@2x.png');
    this.load.image('run-flame', '/images/icons/FocusFlameIcon/focus-flame-transparent.png');
    this.load.image('run-log', '/images/B-4FlightGame/logs/logos@2x.png');
    this.load.image('run-cloud', '/images/B-4FlightGame/Clouds/Cloud@2x.png');
    this.load.image('run-base', '/images/B-4FlightGame/background/GameplayBackgrounds.webp');
    this.load.image('run-sky', '/images/B-4FlightGame/background/layers/sky.png');
    this.load.image('run-mountains-far', '/images/B-4FlightGame/background/layers/mountains_far.png');
    this.load.image('run-mountains-mid', '/images/B-4FlightGame/background/layers/mountains_mid.png');
    this.load.image('run-trees-far', '/images/B-4FlightGame/background/layers/trees_far.png');
    this.load.image('run-trees-mid', '/images/B-4FlightGame/background/layers/trees_mid.png');
    this.load.image('run-fog', '/images/B-4FlightGame/background/layers/fog.png');
    this.load.image('run-leaves', '/images/B-4FlightGame/background/layers/forground_leaves.png');
    this.load.audio('run-pickup', '/audio/b4/flame-tap-1.mp3');
    this.load.audio('run-start-sfx', '/audio/b4/flame-start.mp3');
    this.load.audio('run-hit', '/audio/b4/b4-pause.mp3');
    this.load.audio('run-focus', '/audio/b4/reward.mp3');
  }

  create(): void {
    this.createWorld();
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.flames = this.physics.add.group({ allowGravity: false, immovable: true });
    this.groundShadow = this.add.ellipse(300, FLOOR_Y + 4, 82, 18, 0x020914, .3).setDepth(13);
    this.player = this.physics.add.sprite(300, FLOOR_Y - PLAYER_HEIGHT / 2, 'run-b4').setOrigin(.5).setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT).setDepth(15);
    this.player.setCollideWorldBounds(true).setGravityY(1550);
    this.setPlayerBodyWorld(82, 42, 13, 14);
    this.aura = this.add.circle(this.player.x, this.player.y, 50, 0xffd65a, 0).setDepth(14).setBlendMode(Phaser.BlendModes.ADD);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.overlap(this.player, this.flames, (_player, flame) => this.collect(flame as MovingBody));
    this.physics.add.overlap(this.player, this.obstacles, (_player, obstacle) => this.hit(obstacle as MovingBody));

    this.jumpKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) as Phaser.Input.Keyboard.Key;
    this.downKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN) as Phaser.Input.Keyboard.Key;
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP).on('down', this.jump, this);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W).on('down', this.jump, this);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S).on('down', this.slide, this);
    this.jumpKey.on('down', this.jump, this);
    this.downKey.on('down', this.slide, this);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', this.togglePause, this);
    this.game.events.on(FLAME_RUN_EVENTS.start, this.startRun, this);
    this.game.events.on(FLAME_RUN_EVENTS.jump, this.jump, this);
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
    this.layers.forEach(({ sprite, factor }) => { sprite.tilePositionX += speed * factor * delta / 1000; });
    this.ground.tilePositionX += speed * delta / 1000;
    this.foreground.tilePositionX += speed * 1.18 * delta / 1000;
    [...this.obstacles.getChildren(), ...this.flames.getChildren()].forEach((child) => {
      const body = child as MovingBody;
      body.x -= speed * delta / 1000;
      body.body?.updateFromGameObject();
      if (body.x < -120) body.destroy();
    });
    const grounded = Boolean(this.player.body?.blocked.down || this.player.body?.touching.down) && this.player.y > FLOOR_Y - 70;
    if (grounded && !this.wasGrounded) this.land();
    if (grounded) {
      this.player.y = FLOOR_Y - (this.sliding ? SLIDE_HEIGHT : PLAYER_HEIGHT) / 2;
      if (!this.sliding) this.player.setAngle(0);
    }
    this.wasGrounded = grounded;
    this.aura.setPosition(this.player.x, this.player.y);
    const altitude = Phaser.Math.Clamp((FLOOR_Y - (this.player.y + this.player.displayHeight / 2)) / 112, 0, 1);
    this.groundShadow.setPosition(this.player.x, FLOOR_Y + 4).setScale(1 - altitude * .34, 1 - altitude * .18).setAlpha(.3 - altitude * .18);
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
    if (time - this.lastTrailAt > (focusMode ? 55 : this.sliding ? 70 : 190)) {
      this.addThrusterTrail(focusMode ? 'focus' : this.sliding ? 'slide' : 'run');
      this.lastTrailAt = time;
    }
    if (time - this.lastHud > 100) { this.emitHud(focusMode ? 'B-4: Focus Mode!' : this.messageForStreak()); this.lastHud = time; }
  }

  private createWorld(): void {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x07172b);
    const base = this.add.tileSprite(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 'run-base').setDisplaySize(WIDTH, HEIGHT).setDepth(0);
    this.layers.push({ sprite: base, factor: .025 });
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

  private startRun(): void {
    if (this.started) return;
    this.started = true;
    this.startedAt = this.time.now;
    this.lastSpawn = this.time.now - 900;
    this.sound.play('run-start-sfx', { volume: .3 });
  }

  private jump(): void {
    if (!this.started || this.ended) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down || body.touching.down || this.player.y > FLOOR_Y - 88) {
      this.endSlide();
      this.tweens.killTweensOf(this.player);
      this.player.setAngle(0).setDisplaySize(PLAYER_WIDTH * 1.06, PLAYER_HEIGHT * .94);
      this.tweens.add({ targets: this.player, displayWidth: PLAYER_WIDTH, displayHeight: PLAYER_HEIGHT, duration: 105, ease: 'Quad.Out' });
      this.tweens.add({ targets: this.player, angle: 360, duration: JUMP_DURATION, ease: 'Sine.InOut' });
      this.player.setVelocityY(-590);
      this.player.angle = 0;
    }
  }

  private slide(): void {
    if (!this.started || this.ended || this.sliding) return;
    this.sliding = true;
    this.tweens.killTweensOf(this.player);
    this.player.setY(FLOOR_Y - SLIDE_HEIGHT / 2).setAngle(11).setDisplaySize(SLIDE_WIDTH, SLIDE_HEIGHT);
    this.tweens.add({ targets: this.player, x: 310, duration: 120, ease: 'Quad.Out' });
    this.setPlayerBodyWorld(92, 28, 12, 10);
    this.time.delayedCall(760, () => this.endSlide());
  }

  private endSlide(): void {
    if (!this.sliding) return;
    this.sliding = false;
    this.player.setY(FLOOR_Y - PLAYER_HEIGHT / 2).setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT).setAngle(0);
    this.tweens.add({ targets: this.player, x: 300, duration: 150, ease: 'Quad.Out' });
    this.setPlayerBodyWorld(82, 42, 13, 14);
  }

  private setPlayerBodyWorld(width: number, height: number, offsetX: number, offsetY: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(width / this.player.scaleX, height / this.player.scaleY)
      .setOffset(offsetX / this.player.scaleX, offsetY / this.player.scaleY);
  }

  private spawnPattern(): void {
    const pattern = this.nextPattern++ % 4;
    if (pattern === 0) { this.spawnObstacle('log', FLOOR_Y - 22, 72, 44); this.spawnFlameArc(FLOOR_Y - 90); }
    if (pattern === 1) { this.spawnObstacle('branch', FLOOR_Y - 68, 110, 42); this.spawnFlameLine(FLOOR_Y - 28); }
    if (pattern === 2) { this.spawnObstacle('crystal', FLOOR_Y - 31, 50, 62); this.spawnFlameArc(FLOOR_Y - 112); }
    if (pattern === 3) { this.spawnFlameZigzag(); }
  }

  private spawnObstacle(kind: string, y: number, width: number, height: number): void {
    const texture = kind === 'branch' ? 'run-log' : kind === 'crystal' ? 'run-flame' : 'run-log';
    const obstacle = this.obstacles.create(WIDTH + 120, y, texture) as MovingBody;
    obstacle.kind = kind;
    obstacle.setDisplaySize(width, height).setDepth(13).setTint(kind === 'crystal' ? 0x7bd8ff : kind === 'branch' ? 0x6f472c : 0xffffff);
    if (kind === 'branch') obstacle.setAngle(180);
    (obstacle.body as Phaser.Physics.Arcade.Body).setSize(width * .75, height * .7);
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
    this.player.setTexture('run-b4-hurt');
    this.sound.play('run-hit', { volume: .24 });
    this.cameras.main.shake(180, .007);
    this.tweens.add({ targets: this.player, x: 282, alpha: .35, duration: 85, yoyo: true, repeat: 5, onComplete: () => this.player.setX(300).setAlpha(1).setTexture('run-b4') });
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
    const spark = this.add.image(this.player.x - 52, FLOOR_Y - (this.sliding ? 4 : 9), 'run-flame').setDisplaySize(size, size * 1.3).setDepth(13).setAlpha(mode === 'run' ? .42 : .8).setTint(mode === 'focus' ? 0xffdc57 : 0xffb43b);
    this.tweens.add({ targets: spark, x: spark.x - distance, y: spark.y + Phaser.Math.Between(-7, 7), alpha: 0, duration: mode === 'focus' ? 460 : 320, onComplete: () => spark.destroy() });
  }

  private land(): void {
    this.tweens.killTweensOf(this.player);
    this.player.angle = 0;
    this.player.setY(FLOOR_Y - PLAYER_HEIGHT * .93 / 2).setDisplaySize(PLAYER_WIDTH * 1.06, PLAYER_HEIGHT * .93);
    this.tweens.add({ targets: this.player, y: FLOOR_Y - PLAYER_HEIGHT / 2, displayWidth: PLAYER_WIDTH, displayHeight: PLAYER_HEIGHT, duration: 130, ease: 'Back.Out' });
    for (let i = 0; i < 4; i += 1) {
      const spark = this.add.image(this.player.x + Phaser.Math.Between(-40, 40), FLOOR_Y - 8, 'run-flame').setDisplaySize(9, 12).setDepth(14).setAlpha(.6);
      this.tweens.add({ targets: spark, y: spark.y - Phaser.Math.Between(12, 28), x: spark.x - Phaser.Math.Between(8, 28), alpha: 0, duration: 240, onComplete: () => spark.destroy() });
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
    if (this.state.streak >= 10) return 'B-4: Focus streak!';
    if (this.state.streak >= 5) return 'B-4: Nice! Keep going!';
    return 'B-4: Jump, slide, and follow the flames!';
  }

  private emitHud(message: string): void {
    const hud: FlameRunHud = { ...this.state, focusMode: this.state.focusModeUntil > this.time.now, message };
    this.game.events.emit(FLAME_RUN_EVENTS.hud, hud);
  }
}
