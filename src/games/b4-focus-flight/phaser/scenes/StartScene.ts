import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
