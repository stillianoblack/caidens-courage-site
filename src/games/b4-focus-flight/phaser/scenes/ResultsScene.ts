import Phaser from 'phaser';
import { B4_FOCUS_FLIGHT_EVENTS, type B4FocusFlightResult } from '../types';

export default class ResultsScene extends Phaser.Scene {
  constructor() {
    super('ResultsScene');
  }

  create(data: { result?: B4FocusFlightResult }): void {
    if (data.result) {
      this.game.events.emit(B4_FOCUS_FLIGHT_EVENTS.result, data.result);
    }
  }
}
