import Phaser from 'phaser';
import {
  activateCheckpoint,
  collectFocusFlame,
  completeDragonNest,
  createDragonNestRunState,
  findBabyDragon,
  loseCourage,
  recordClue,
} from '../state';
import {
  BABY_DRAGON_POINT,
  CHECKPOINTS,
  CLUES,
  CRACKED_ZONES,
  FLAME_POINTS,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  NEST_POINT,
  ROCKS,
  WIND_ZONE,
} from '../data/level1';
import { DRAGON_NEST_EVENTS, type DragonNestHud, type DragonNestRunState } from '../types';

type Direction = { x: number; y: number };

export default class CaveScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private b4!: Phaser.GameObjects.Image;
  private babyDragon!: Phaser.GameObjects.Image;
  private obstacleGroup!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'up' | 'down' | 'left' | 'right' | 'inspect', Phaser.Input.Keyboard.Key>;
  private virtualDirection: Direction = { x: 0, y: 0 };
  private state: DragonNestRunState = createDragonNestRunState();
  private message = 'B-4: Follow the glowing trail.';
  private nearbyClue: typeof CLUES[number] | null = null;
  private lastHazardAt = 0;
  private revealInProgress = false;

  constructor() {
    super('DragonNestCave');
  }

  preload(): void {
    this.load.image('dnr-cave', '/images/focus-flame-lab/thecave_block_image.webp');
    this.load.image('dnr-caiden', '/images/caidenscourage/Game-Hub/characters/caiden-hotspot.webp');
    this.load.image('dnr-b4', '/images/caidenscourage/Game-Hub/characters/b4-hotspot.webp');
    this.load.image('dnr-dragon', '/images/characters/dragon_img_profile.webp');
    this.load.image('dnr-flame', '/images/B-4FlightGame/Sparkle Flame/Asset 11.png');
    this.load.audio('dnr-pickup', '/audio/b4/flame-tap-1.mp3');
    this.load.audio('dnr-checkpoint', '/audio/b4/ui-confirm.mp3');
    this.load.audio('dnr-complete', '/audio/b4/reward.mp3');
  }

  create(): void {
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    this.createEnvironment();
    this.createCollectibles();
    this.createCheckpointsAndClues();

    this.player = this.physics.add.sprite(this.state.checkpoint.x, this.state.checkpoint.y, 'dnr-caiden');
    this.player.setDisplaySize(94, 94).setCircle(34, 13, 13).setCollideWorldBounds(true).setDepth(12);
    this.b4 = this.add.image(this.player.x - 76, this.player.y + 42, 'dnr-b4').setDisplaySize(66, 66).setDepth(11);
    this.babyDragon = this.add.image(BABY_DRAGON_POINT.x, BABY_DRAGON_POINT.y, 'dnr-dragon')
      .setDisplaySize(82, 98).setAlpha(0).setDepth(10);
    this.physics.add.collider(this.player, this.obstacleGroup);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.05);
    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.wasd = this.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      inspect: Phaser.Input.Keyboard.KeyCodes.E,
    }) as typeof this.wasd;
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', () => this.inspect());
    this.wasd.inspect.on('down', () => this.inspect());

    this.game.events.on(DRAGON_NEST_EVENTS.direction, this.setVirtualDirection, this);
    this.game.events.on(DRAGON_NEST_EVENTS.inspect, this.inspect, this);
    this.game.events.on(DRAGON_NEST_EVENTS.restart, this.restartRun, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(DRAGON_NEST_EVENTS.direction, this.setVirtualDirection, this);
      this.game.events.off(DRAGON_NEST_EVENTS.inspect, this.inspect, this);
      this.game.events.off(DRAGON_NEST_EVENTS.restart, this.restartRun, this);
    });

    this.time.addEvent({ delay: 3900, loop: true, callback: () => this.dropRockWarning() });
    this.emitHud();
    this.game.events.emit(DRAGON_NEST_EVENTS.ready);
  }

  update(time: number): void {
    if (!this.player || this.state.complete || this.state.courage <= 0 || this.revealInProgress) return;
    const keyboardX = (this.cursors.left.isDown || this.wasd.left.isDown ? -1 : 0) + (this.cursors.right.isDown || this.wasd.right.isDown ? 1 : 0);
    const keyboardY = (this.cursors.up.isDown || this.wasd.up.isDown ? -1 : 0) + (this.cursors.down.isDown || this.wasd.down.isDown ? 1 : 0);
    const direction = new Phaser.Math.Vector2(keyboardX || this.virtualDirection.x, keyboardY || this.virtualDirection.y);
    if (direction.lengthSq() > 0) direction.normalize().scale(235);
    this.player.setVelocity(direction.x, direction.y);
    if (direction.x !== 0) this.player.setFlipX(direction.x < 0);

    this.b4.x = Phaser.Math.Linear(this.b4.x, this.player.x - (this.player.flipX ? -72 : 72), 0.055);
    this.b4.y = Phaser.Math.Linear(this.b4.y, this.player.y + 38 + Math.sin(time / 360) * 7, 0.055);
    if (this.state.babyDragonFound) {
      this.babyDragon.x = Phaser.Math.Linear(this.babyDragon.x, this.player.x - (this.player.flipX ? -115 : 115), 0.027);
      this.babyDragon.y = Phaser.Math.Linear(this.babyDragon.y, this.player.y + 48, 0.027);
      if (Phaser.Math.Distance.Between(this.babyDragon.x, this.babyDragon.y, this.player.x, this.player.y) > 360) {
        this.setMessage('B-4: Wait up — the little dragon is falling behind!');
      }
    }

    this.applyHazardZones(time);
    this.checkCheckpoints();
    this.checkClues();
    if (!this.state.babyDragonFound && this.player.x > 1970 && this.state.cluesFound.length >= CLUES.length) {
      this.revealBabyDragon();
    } else if (!this.state.babyDragonFound && this.player.x > 1970 && this.message !== 'B-4: We still need to inspect the clues along the trail.') {
      this.setMessage('B-4: We still need to inspect the clues along the trail.');
    }
    if (this.state.babyDragonFound && this.player.x > NEST_POINT.x - 80 && Math.abs(this.player.y - NEST_POINT.y) < 220) {
      this.state = completeDragonNest(this.state);
      this.player.setVelocity(0);
      this.setMessage('B-4: You followed the clues, stayed focused, and brought the dragon home.');
      this.emitHud();
      this.sound.play('dnr-complete', { volume: 0.35 });
      this.time.delayedCall(700, () => this.game.events.emit(DRAGON_NEST_EVENTS.result, {
        complete: true,
        courage: this.state.courage,
        flames: this.state.flames,
        totalFlames: this.state.totalFlames,
      }));
    }
  }

  private createEnvironment(): void {
    this.obstacleGroup = this.physics.add.staticGroup();
    this.add.tileSprite(LEVEL_WIDTH / 2, LEVEL_HEIGHT / 2, LEVEL_WIDTH, LEVEL_HEIGHT, 'dnr-cave')
      .setAlpha(0.38).setTint(0x24446b);
    const ground = this.add.graphics().setDepth(1);
    ground.fillStyle(0x08182d, 0.78).fillRect(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    ground.lineStyle(110, 0x1a3951, 0.92);
    const path = new Phaser.Curves.Spline([
      new Phaser.Math.Vector2(160, 800), new Phaser.Math.Vector2(520, 590),
      new Phaser.Math.Vector2(900, 720), new Phaser.Math.Vector2(1280, 600),
      new Phaser.Math.Vector2(1640, 710), new Phaser.Math.Vector2(2020, 560),
      new Phaser.Math.Vector2(2500, 760),
    ]);
    path.draw(ground, 64);
    ROCKS.forEach(([x, y, width, height]) => {
      ground.fillStyle(0x101e31, 1).fillRoundedRect(x, y, width, height, 28);
      ground.lineStyle(5, 0x37506a, 0.8).strokeRoundedRect(x, y, width, height, 28);
      const obstacle = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0);
      this.physics.add.existing(obstacle, true);
      this.obstacleGroup.add(obstacle);
    });
    CRACKED_ZONES.forEach((zone) => {
      ground.fillStyle(0x3b2630, 0.75).fillRoundedRect(zone.x, zone.y, zone.width, zone.height, 20);
      ground.lineStyle(4, 0xd07b60, 0.45);
      for (let offset = 30; offset < zone.width; offset += 55) ground.lineBetween(zone.x + offset, zone.y + 15, zone.x + offset - 20, zone.y + zone.height - 15);
    });
    ground.fillStyle(0x244c63, 0.38).fillRoundedRect(WIND_ZONE.x, WIND_ZONE.y, WIND_ZONE.width, WIND_ZONE.height, 40);
    for (let index = 0; index < 8; index += 1) {
      ground.lineStyle(3, 0x8ee6ff, 0.28).lineBetween(WIND_ZONE.x + 20, WIND_ZONE.y + 30 + index * 38, WIND_ZONE.x + 320, WIND_ZONE.y + 10 + index * 38);
    }
    const nestGlow = this.add.circle(NEST_POINT.x, NEST_POINT.y, 150, 0xf4c45f, 0.12).setDepth(3);
    this.tweens.add({ targets: nestGlow, alpha: 0.28, scale: 1.12, duration: 1500, yoyo: true, repeat: -1 });
    this.add.text(NEST_POINT.x, NEST_POINT.y - 150, "DRAGON'S NEST", { fontFamily: 'sans-serif', fontSize: '28px', color: '#ffe49a', fontStyle: 'bold' }).setOrigin(0.5).setDepth(4);
  }

  private createCollectibles(): void {
    const flames = this.physics.add.staticGroup();
    FLAME_POINTS.forEach(([x, y], index) => {
      const flame = flames.create(x, y, 'dnr-flame') as Phaser.Physics.Arcade.Image;
      flame.setDisplaySize(48, 62).setData('id', index).setDepth(8);
      this.tweens.add({ targets: flame, y: y - 12, alpha: 0.75, duration: 900 + index * 45, yoyo: true, repeat: -1 });
    });
    this.events.once(Phaser.Scenes.Events.UPDATE, () => {
      this.physics.add.overlap(this.player, flames, (_player, object) => {
        const flame = object as Phaser.Physics.Arcade.Image;
        if (!flame.active) return;
        flame.disableBody(true, true);
        this.state = collectFocusFlame(this.state);
        this.sound.play('dnr-pickup', { volume: 0.28 });
        this.setMessage(this.state.flames === this.state.totalFlames ? 'B-4: Every Focus Flame! Amazing!' : 'B-4: Focus Flame found!');
        this.emitHud();
      });
    });
  }

  private createCheckpointsAndClues(): void {
    CHECKPOINTS.forEach((checkpoint) => {
      const ring = this.add.circle(checkpoint.x, checkpoint.y, 54, 0xffcf67, 0.12).setStrokeStyle(5, 0xffd978, 0.8).setDepth(5).setData('checkpoint', checkpoint.id);
      this.tweens.add({ targets: ring, scale: 1.14, alpha: 0.3, duration: 1200, yoyo: true, repeat: -1 });
    });
    CLUES.forEach((clue) => {
      const marker = this.add.star(clue.x, clue.y, 5, 12, 25, 0x76e7ff, 0.7).setDepth(7).setData('clue', clue.id);
      this.tweens.add({ targets: marker, angle: 360, duration: 6000, repeat: -1 });
      this.add.text(clue.x, clue.y + 34, clue.label, { fontFamily: 'sans-serif', fontSize: '15px', color: '#bdefff' }).setOrigin(0.5).setDepth(7);
    });
  }

  private checkCheckpoints(): void {
    CHECKPOINTS.forEach((checkpoint) => {
      if (checkpoint.id > this.state.checkpointId && Phaser.Math.Distance.Between(this.player.x, this.player.y, checkpoint.x, checkpoint.y) < 70) {
        this.state = activateCheckpoint(this.state, checkpoint.id, { x: checkpoint.x, y: checkpoint.y });
        this.sound.play('dnr-checkpoint', { volume: 0.3 });
        this.cameras.main.flash(320, 255, 215, 110, false);
        this.setMessage(`B-4: ${checkpoint.label} checkpoint! Courage restored.`);
        this.emitHud();
      }
    });
  }

  private checkClues(): void {
    const next = CLUES.find((clue) => !this.state.cluesFound.includes(clue.id) && Phaser.Math.Distance.Between(this.player.x, this.player.y, clue.x, clue.y) < 115) ?? null;
    if (next?.id !== this.nearbyClue?.id) {
      this.nearbyClue = next;
      if (next) this.setMessage(`Inspect: ${next.label}  •  Press E, Space, or Inspect`);
    }
  }

  private inspect(): void {
    if (!this.nearbyClue) return;
    this.state = recordClue(this.state, this.nearbyClue.id);
    this.setMessage(`B-4: ${this.nearbyClue.message}`);
    this.nearbyClue = null;
    this.emitHud();
  }

  private applyHazardZones(time: number): void {
    const inCracks = CRACKED_ZONES.some((zone) => Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(zone.x, zone.y, zone.width, zone.height), this.player.x, this.player.y));
    if (inCracks) this.player.setVelocity((this.player.body?.velocity.x ?? 0) * 0.58, (this.player.body?.velocity.y ?? 0) * 0.58);
    if (Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(WIND_ZONE.x, WIND_ZONE.y, WIND_ZONE.width, WIND_ZONE.height), this.player.x, this.player.y)) {
      this.player.setVelocityX((this.player.body?.velocity.x ?? 0) - 75);
    }
    if (inCracks && time - this.lastHazardAt > 1700) this.takeHazardHit('B-4: Cracked ground — keep moving!');
  }

  private dropRockWarning(): void {
    if (!this.player?.active || this.state.complete || this.state.courage <= 0) return;
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-120, 120), 120, LEVEL_WIDTH - 120);
    const y = Phaser.Math.Clamp(this.player.y + Phaser.Math.Between(-120, 120), 120, LEVEL_HEIGHT - 120);
    const warning = this.add.circle(x, y, 44, 0xff8364, 0.18).setStrokeStyle(5, 0xffa17d, 0.8).setDepth(16);
    this.setMessage('B-4: Watch the falling rocks!');
    this.tweens.add({ targets: warning, scale: 1.35, alpha: 0.65, duration: 700, yoyo: true });
    this.time.delayedCall(950, () => {
      warning.destroy();
      const rock = this.add.circle(x, y, 42, 0x263243, 1).setStrokeStyle(5, 0x6f7d8c).setDepth(16).setScale(1.6);
      this.tweens.add({ targets: rock, scale: 1, duration: 150, onComplete: () => this.time.delayedCall(500, () => rock.destroy()) });
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y) < 80) this.takeHazardHit('B-4: Courage reset — you can do this!');
    });
  }

  private takeHazardHit(message: string): void {
    const now = this.time.now;
    if (now - this.lastHazardAt < 1200) return;
    this.lastHazardAt = now;
    this.state = loseCourage(this.state);
    this.cameras.main.shake(180, 0.008);
    this.setMessage(message);
    this.emitHud();
    if (this.state.courage <= 0) {
      this.player.setVelocity(0);
      this.game.events.emit(DRAGON_NEST_EVENTS.result, {
        complete: false,
        courage: 0,
        flames: this.state.flames,
        totalFlames: this.state.totalFlames,
      });
    }
  }

  private revealBabyDragon(): void {
    this.revealInProgress = true;
    this.player.setVelocity(0);
    this.babyDragon.setAlpha(1).setScale(0.5);
    this.cameras.main.stopFollow();
    this.cameras.main.pan(BABY_DRAGON_POINT.x, BABY_DRAGON_POINT.y, 650, 'Sine.easeInOut');
    this.tweens.add({ targets: this.babyDragon, scale: 1, alpha: 1, duration: 650 });
    this.time.delayedCall(700, () => this.setMessage('B-4: Caiden… I think we found who was calling.'));
    this.time.delayedCall(1600, () => {
      this.state = findBabyDragon(this.state);
      this.revealInProgress = false;
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      this.emitHud();
    });
  }

  private setVirtualDirection(direction: Direction): void {
    this.virtualDirection = direction;
  }

  private setMessage(message: string): void {
    this.message = message;
    this.emitHud();
  }

  private emitHud(): void {
    const hud: DragonNestHud = {
      courage: this.state.courage,
      flames: this.state.flames,
      totalFlames: this.state.totalFlames,
      objective: this.state.objective,
      message: this.message,
    };
    this.game.events.emit(DRAGON_NEST_EVENTS.hud, hud);
  }

  private restartRun(): void {
    this.scene.restart();
  }
}
