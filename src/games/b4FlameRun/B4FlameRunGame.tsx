import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Phaser from 'phaser';
import FlameRunScene from './FlameRunScene';
import { FLAME_RUN_EVENTS, type FlameRunHud, type FlameRunResult } from './types';

export type B4FlameRunGameHandle = { start: () => void; jump: () => void; releaseJump: () => void; slide: () => void; pause: () => void; resume: () => void; restart: () => void };

type Props = { onReady: () => void; onHud: (hud: FlameRunHud) => void; onResult: (result: FlameRunResult) => void; onPauseChange: (paused: boolean) => void };

const B4FlameRunGame = forwardRef<B4FlameRunGameHandle, Props>(({ onReady, onHud, onResult, onPauseChange }, ref) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const emitWhenSceneIsActive = (event: string) => {
    const attempt = () => {
      const game = gameRef.current;
      if (!game) return;
      if (game.scene.scenes.some((scene) => scene.scene.isActive())) {
        game.events.emit(event);
        return;
      }
      window.setTimeout(attempt, 50);
    };
    attempt();
  };

  useImperativeHandle(ref, () => ({
    start: () => emitWhenSceneIsActive(FLAME_RUN_EVENTS.start),
    jump: () => gameRef.current?.events.emit(FLAME_RUN_EVENTS.jump),
    releaseJump: () => gameRef.current?.events.emit(FLAME_RUN_EVENTS.jumpEnd),
    slide: () => gameRef.current?.events.emit(FLAME_RUN_EVENTS.slide),
    pause: () => gameRef.current?.events.emit(FLAME_RUN_EVENTS.pause),
    resume: () => gameRef.current?.events.emit(FLAME_RUN_EVENTS.resume),
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
    let readyPoll: number | undefined;
    const handleSceneReady = () => {
      if (readyPoll !== undefined) window.clearInterval(readyPoll);
      onReady();
    };
    game.events.on(FLAME_RUN_EVENTS.ready, handleSceneReady);
    game.events.on(FLAME_RUN_EVENTS.hud, onHud);
    game.events.on(FLAME_RUN_EVENTS.result, onResult);
    game.events.on(FLAME_RUN_EVENTS.pauseState, onPauseChange);
    // Cached assets can let a remounted scene finish before these listeners attach.
    // Poll only during boot to reconcile that synchronous-ready case.
    readyPoll = window.setInterval(() => {
      if (game.scene.scenes.some((scene) => scene.scene.isActive())) handleSceneReady();
    }, 50);
    if (game.scene.scenes.some((scene) => scene.scene.isActive())) handleSceneReady();
    const handleVisibility = () => {
      if (document.hidden) game.events.emit(FLAME_RUN_EVENTS.pause);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (readyPoll !== undefined) window.clearInterval(readyPoll);
      game.events.off(FLAME_RUN_EVENTS.ready, handleSceneReady);
      game.events.off(FLAME_RUN_EVENTS.hud, onHud);
      game.events.off(FLAME_RUN_EVENTS.result, onResult);
      game.events.off(FLAME_RUN_EVENTS.pauseState, onPauseChange);
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onHud, onPauseChange, onReady, onResult]);

  return <div ref={hostRef} className="b4run-gameHost" aria-label="B-4 Flame Run game canvas" />;
});

B4FlameRunGame.displayName = 'B4FlameRunGame';
export default B4FlameRunGame;
