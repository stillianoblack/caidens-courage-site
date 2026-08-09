import type { B4StateKey } from '../../../data/b4/variantManifest';

export type B4StateTimer = unknown;
export type B4StateScheduler = (delayMs: number, callback: () => void) => B4StateTimer;
export type B4StateCanceller = (timer: B4StateTimer) => void;

const PRIORITY: Record<B4StateKey, number> = { idle: 0, blinking: 1, happy: 2, hurt: 3 };

export class B4FlightStateMachine {
  private current: B4StateKey = 'idle';
  private timer: B4StateTimer | null = null;
  private generation = 0;
  private disposed = false;

  constructor(
    private readonly onChange: (state: B4StateKey) => void,
    private readonly schedule: B4StateScheduler,
    private readonly cancel: B4StateCanceller,
  ) {}

  get state(): B4StateKey { return this.current; }

  request(next: B4StateKey, durationMs?: number): boolean {
    if (this.disposed) return false;
    if (next !== 'idle' && PRIORITY[next] < PRIORITY[this.current]) return false;
    this.clearTimer();
    this.current = next;
    this.onChange(next);
    const generation = ++this.generation;
    if (durationMs && next !== 'idle') {
      this.timer = this.schedule(durationMs, () => {
        if (this.disposed || generation !== this.generation || this.current !== next) return;
        this.timer = null;
        this.current = 'idle';
        this.onChange('idle');
      });
    }
    return true;
  }

  reset(): void { this.request('idle'); }

  dispose(): void {
    this.disposed = true;
    this.generation += 1;
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timer !== null) this.cancel(this.timer);
    this.timer = null;
  }
}
