import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import PreloadScene from './scenes/PreloadScene';
import ResultsScene from './scenes/ResultsScene';
import StartScene from './scenes/StartScene';

export const createB4FocusFlightGame = (parent: HTMLElement): Phaser.Game => {
  parent.innerHTML = '';

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#091228',
    scene: [BootScene, PreloadScene, StartScene, GameScene, ResultsScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { x: 0, y: 0 },
      },
    },
    render: {
      antialias: true,
      antialiasGL: true,
      pixelArt: false,
      roundPixels: false,
    },
    input: {
      activePointers: 2,
    },
  });
};
