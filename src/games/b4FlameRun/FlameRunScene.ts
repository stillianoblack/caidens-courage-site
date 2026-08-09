import Phaser from 'phaser';
import { addDistance, collectFlame, createFlameRunState, isRunOver, loseCourage, scrollSpeedFor, type FlameRunState } from './state';
import { FLAME_RUN_EVENTS, type FlameRunHud, type FlameRunResult } from './types';

const WIDTH = 1200;
const HEIGHT = 675;
const FLOOR_Y = 548;
const BEST_SCORE_KEY = 'b4-flame-run:best-score';

type MovingBody = Phaser.Physics.Arcade.Image & { kind?: string };

export default class FlameRunScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private ground!: Phaser.GameObjects.TileSprite;
  private layers: { sprite: Phaser.GameObjects.TileSprite; factor: number }[] = [];
  private obstacles!: Phaser.Physics.Arcade.Group;
  private flames!: Phaser.Physics.Arcade.Group;
  private state: FlameRunState = createFlameRunState();
  private started = false;
  private ended = false;
  private sliding = false;
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
    this.player = this.physics.add.sprite(330, FLOOR_Y - 72, 'run-b4').setDisplaySize(174, 112).setDepth(15);
    this.player.setCollideWorldBounds(true).setGravityY(1550);
    this.setPlayerBody(132, 72, 20, 20);
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
    this.game.events.on(FLAME_RUN_EVENTS.start, this.startRun, this);
    this.game.events.on(FLAME_RUN_EVENTS.jump, this.jump, this);
    this.game.events.on(FLAME_RUN_EVENTS.slide, this.slide, this);
    this.game.events.on(FLAME_RUN_EVENTS.restart, this.restart, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      Object.values(FLAME_RUN_EVENTS).forEach((event) => this.game.events.removeAllListeners(event));
    });
    this.emitHud('B-4: Ready to run!');
    this.game.events.emit(FLAME_RUN_EVENTS.ready);
  }

  update(time: number, delta: number): void {
    if (!this.started || this.ended) return;
    const elapsed = (time - this.startedAt) / 1000;
    const speed = scrollSpeedFor(elapsed);
    this.layers.forEach(({ sprite, factor }) => { sprite.tilePositionX += speed * factor * delta / 1000; });
    this.ground.tilePositionX += speed * delta / 1000;
    [...this.obstacles.getChildren(), ...this.flames.getChildren()].forEach((child) => {
      const body = child as MovingBody;
      body.x -= speed * delta / 1000;
      body.body?.updateFromGameObject();
      if (body.x < -120) body.destroy();
    });
    if (this.player.body?.blocked.down && this.player.y > FLOOR_Y - 90) this.player.setAngle(this.sliding ? 8 : 0);
    if (time - this.lastSpawn > Math.max(1050, 1900 - speed)) {
      this.spawnPattern();
      this.lastSpawn = time;
    }
    if (time - this.lastTick > 250) {
      this.state = addDistance(this.state, speed * .25 / 10);
      this.lastTick = time;
    }
    const focusMode = this.state.focusModeUntil > time;
    this.player.setTint(focusMode ? 0xffe281 : 0xffffff);
    if (focusMode && Phaser.Math.Between(0, 5) === 0) this.addFocusTrail();
    if (time - this.lastHud > 100) { this.emitHud(focusMode ? 'B-4: Focus Mode!' : this.messageForStreak()); this.lastHud = time; }
  }

  private createWorld(): void {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x07172b);
    const base = this.add.tileSprite(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 'run-base').setDisplaySize(WIDTH, HEIGHT).setDepth(0);
    this.layers.push({ sprite: base, factor: .025 });
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x06172c, .2).setDepth(8);
    this.ground = this.add.tileSprite(WIDTH / 2, FLOOR_Y + 78, WIDTH, 158, 'run-base').setTint(0x10293c).setDepth(10);
    this.physics.add.existing(this.ground, true);
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
      this.player.setVelocityY(-660);
      this.tweens.add({ targets: this.player, angle: -7, duration: 90, yoyo: true });
    }
  }

  private slide(): void {
    if (!this.started || this.ended || this.sliding) return;
    this.sliding = true;
    this.player.setAngle(8).setDisplaySize(188, 74);
    this.setPlayerBody(142, 44, 15, 48);
    this.time.delayedCall(760, () => this.endSlide());
  }

  private endSlide(): void {
    if (!this.sliding) return;
    this.sliding = false;
    this.player.setDisplaySize(174, 112).setAngle(0);
    this.setPlayerBody(132, 72, 20, 20);
  }

  private setPlayerBody(width: number, height: number, offsetX: number, offsetY: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(width, height).setOffset(offsetX, offsetY);
  }

  private spawnPattern(): void {
    const pattern = this.nextPattern++ % 4;
    if (pattern === 0) { this.spawnObstacle('log', FLOOR_Y - 38, 112, 72); this.spawnFlameArc(FLOOR_Y - 130); }
    if (pattern === 1) { this.spawnObstacle('branch', FLOOR_Y - 146, 170, 60); this.spawnFlameLine(FLOOR_Y - 58); }
    if (pattern === 2) { this.spawnObstacle('crystal', FLOOR_Y - 50, 78, 98); this.spawnFlameArc(FLOOR_Y - 165); }
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
    this.cameras.main.shake(180, .008);
    this.tweens.add({ targets: this.player, alpha: .3, duration: 90, yoyo: true, repeat: 5, onComplete: () => this.player.setAlpha(1).setTexture('run-b4') });
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

  private addFocusTrail(): void {
    const spark = this.add.image(this.player.x - 78, this.player.y + 18, 'run-flame').setDisplaySize(20, 26).setDepth(14).setAlpha(.75);
    this.tweens.add({ targets: spark, x: spark.x - 90, alpha: 0, duration: 420, onComplete: () => spark.destroy() });
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
