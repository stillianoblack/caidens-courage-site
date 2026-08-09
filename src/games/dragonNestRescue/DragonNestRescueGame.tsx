import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Phaser from 'phaser';
import CaveScene from './scenes/CaveScene';
import { DRAGON_NEST_EVENTS, type DragonNestHud, type DragonNestResult } from './types';

export type DragonNestRescueGameHandle = {
  restart: () => void;
  direction: (x: number, y: number) => void;
  inspect: () => void;
};

type Props = {
  onReady: () => void;
  onHud: (hud: DragonNestHud) => void;
  onResult: (result: DragonNestResult) => void;
};

const DragonNestRescueGame = forwardRef<DragonNestRescueGameHandle, Props>(({ onReady, onHud, onResult }, ref) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useImperativeHandle(ref, () => ({
    restart: () => gameRef.current?.events.emit(DRAGON_NEST_EVENTS.restart),
    direction: (x, y) => gameRef.current?.events.emit(DRAGON_NEST_EVENTS.direction, { x, y }),
    inspect: () => gameRef.current?.events.emit(DRAGON_NEST_EVENTS.inspect),
  }));

  useEffect(() => {
    if (!hostRef.current) return undefined;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 1100,
      height: 680,
      backgroundColor: '#061427',
      scene: [CaveScene],
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1100, height: 680 },
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      input: { activePointers: 3 },
      render: { antialias: true, pixelArt: false, powerPreference: 'high-performance' },
    });
    gameRef.current = game;
    game.events.on(DRAGON_NEST_EVENTS.ready, onReady);
    game.events.on(DRAGON_NEST_EVENTS.hud, onHud);
    game.events.on(DRAGON_NEST_EVENTS.result, onResult);
    return () => {
      game.events.off(DRAGON_NEST_EVENTS.ready, onReady);
      game.events.off(DRAGON_NEST_EVENTS.hud, onHud);
      game.events.off(DRAGON_NEST_EVENTS.result, onResult);
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onHud, onReady, onResult]);

  return <div ref={hostRef} className="dnr-gameHost" aria-label="Dragon Nest Rescue game canvas" />;
});

DragonNestRescueGame.displayName = 'DragonNestRescueGame';
export default DragonNestRescueGame;
