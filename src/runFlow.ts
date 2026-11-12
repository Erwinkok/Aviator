export type RunPhase = 'ready' | 'playing' | 'paused' | 'over';

/** User intent is separate from temporary page/renderer suspension. */
export class RunFlow {
  private phase: RunPhase = 'ready';
  get state(): RunPhase { return this.phase; }

  play(): boolean { return this.move('ready', 'playing'); }
  pause(): boolean { return this.move('playing', 'paused'); }
  resume(): boolean { return this.move('paused', 'playing'); }
  finish(): boolean { return this.move('playing', 'over'); }
  retry(): boolean { return this.move('over', 'playing'); }

  private move(from: RunPhase, to: RunPhase): boolean {
    if (this.phase !== from) return false;
    this.phase = to;
    return true;
  }
}
