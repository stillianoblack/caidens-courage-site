import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import type Phaser from 'phaser';
import { createB4FocusFlightGame } from './phaser/createGame';
import {
  B4_FOCUS_FLIGHT_EVENTS,
  type B4FocusFlightHudState,
  type B4FocusFlightResult,
} from './phaser/types';

export interface B4FocusFlightGameHandle {
  restart: () => void;
  togglePause: () => void;
  toggleMute: () => void;
}

interface B4FocusFlightGameProps {
  onHud: (hud: B4FocusFlightHudState) => void;
  onResult: (result: B4FocusFlightResult) => void;
  mobileGraphics?: boolean;
}

const B4FocusFlightGame = forwardRef<B4FocusFlightGameHandle, B4FocusFlightGameProps>(
  ({ onHud, onResult, mobileGraphics = false }, ref) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useImperativeHandle(ref, () => ({
      restart: () => gameRef.current?.events.emit(B4_FOCUS_FLIGHT_EVENTS.restart),
      togglePause: () => gameRef.current?.events.emit(B4_FOCUS_FLIGHT_EVENTS.pauseToggle),
      toggleMute: () => gameRef.current?.events.emit(B4_FOCUS_FLIGHT_EVENTS.muteToggle),
    }));

    useEffect(() => {
      if (typeof window === 'undefined' || !hostRef.current) return undefined;

      let disposed = false;
      const host = hostRef.current;
      const game = createB4FocusFlightGame(host, { mobileGraphics });
      gameRef.current = game;

      const handleHud = (hud: B4FocusFlightHudState) => {
        if (!disposed) onHud(hud);
      };
      const handleResult = (result: B4FocusFlightResult) => {
        if (!disposed) onResult(result);
      };

      game.events.on(B4_FOCUS_FLIGHT_EVENTS.hud, handleHud);
      game.events.on(B4_FOCUS_FLIGHT_EVENTS.result, handleResult);

      return () => {
        disposed = true;
        game.events.off(B4_FOCUS_FLIGHT_EVENTS.hud, handleHud);
        game.events.off(B4_FOCUS_FLIGHT_EVENTS.result, handleResult);
        game.destroy(true);
        if (host) host.innerHTML = '';
        if (gameRef.current === game) gameRef.current = null;
      };
    }, [mobileGraphics, onHud, onResult]);

    return <div ref={hostRef} className="b4ff-phaserHost" aria-label="B-4 Focus Flight game canvas" />;
  },
);

B4FocusFlightGame.displayName = 'B4FocusFlightGame';

export default B4FocusFlightGame;
