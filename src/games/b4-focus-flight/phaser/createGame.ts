import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import PreloadScene from './scenes/PreloadScene';
import ResultsScene from './scenes/ResultsScene';
import StartScene from './scenes/StartScene';
import type { B4VariantKey } from '../../../data/b4/variantManifest';

interface B4FocusFlightGameOptions {
  mobileGraphics?: boolean;
  variant?: B4VariantKey;
}

export const createB4FocusFlightGame = (
  parent: HTMLElement,
  options: B4FocusFlightGameOptions = {},
): Phaser.Game => {
  parent.innerHTML = '';

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#091228',
    scene: [BootScene, PreloadScene, StartScene, GameScene, ResultsScene],
    scale: {
      mode: Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      autoRound: options.mobileGraphics,
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
      powerPreference: options.mobileGraphics ? 'low-power' : 'high-performance',
      maxTextures: options.mobileGraphics ? 8 : undefined,
    },
    input: {
      activePointers: 2,
    },
    callbacks: {
      preBoot: (game) => {
        game.registry.set('b4MobileGraphics', Boolean(options.mobileGraphics));
        game.registry.set('b4Variant', options.variant ?? 'courage');
      },
    },
  });
};
