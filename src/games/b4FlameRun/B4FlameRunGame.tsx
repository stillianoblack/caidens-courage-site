import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Phaser from 'phaser';
import FlameRunScene from './FlameRunScene';
import { FLAME_RUN_EVENTS, type FlameRunHud, type FlameRunResult } from './types';

export type B4FlameRunGameHandle = { start: () => void; jump: () => void; slide: () => void; restart: () => void };

type Props = { onReady: () => void; onHud: (hud: FlameRunHud) => void; onResult: (result: FlameRunResult) => void };

const B4FlameRunGame = forwardRef<B4FlameRunGameHandle, Props>(({ onReady, onHud, onResult }, ref) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useImperativeHandle(ref, () => ({
    start: () => gameRef.current?.events.emit(FLAME_RUN_EVENTS.start),
    jump: () => gameRef.current?.events.emit(FLAME_RUN_EVENTS.jump),
    slide: () => gameRef.current?.events.emit(FLAME_RUN_EVENTS.slide),
    restart: () => gameRef.current?.events.emit(FLAME_RUN_EVENTS.restart),
  }));

  useEffect(() => {
    if (!hostRef.current) return undefined;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 1200,
      height: 675,
      backgroundColor: '#07172b',
      scene: [FlameRunScene],
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1200, height: 675 },
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      input: { activePointers: 3 },
      render: { antialias: true, pixelArt: false, powerPreference: 'high-performance' },
    });
    gameRef.current = game;
    game.events.on(FLAME_RUN_EVENTS.ready, onReady);
    game.events.on(FLAME_RUN_EVENTS.hud, onHud);
    game.events.on(FLAME_RUN_EVENTS.result, onResult);
    return () => {
      game.events.off(FLAME_RUN_EVENTS.ready, onReady);
      game.events.off(FLAME_RUN_EVENTS.hud, onHud);
      game.events.off(FLAME_RUN_EVENTS.result, onResult);
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onHud, onReady, onResult]);

  return <div ref={hostRef} className="b4run-gameHost" aria-label="B-4 Flame Run game canvas" />;
});

B4FlameRunGame.displayName = 'B4FlameRunGame';
export default B4FlameRunGame;

