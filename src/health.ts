export const MAX_HEARTS = 3;
export const HIT_PROTECTION_SECONDS = 1.5;

/** Protection advances only with active simulation, never with background time. */
export class Health {
  private remaining = MAX_HEARTS;
  private protection = 0;

  get hearts(): number { return this.remaining; }
  get protected(): boolean { return this.protection > 0; }
  get gameOver(): boolean { return this.remaining === 0; }

  update(delta: number): void {
    this.protection = Math.max(0, this.protection - Math.max(0, delta));
    if (this.protection < 1e-9) this.protection = 0;
  }

  hit(): boolean {
    if (this.gameOver || this.protected) return false;
    this.remaining--;
    this.protection = this.gameOver ? 0 : HIT_PROTECTION_SECONDS;
    return true;
  }

  repair(): boolean {
    if (this.gameOver || this.remaining >= MAX_HEARTS) return false;
    this.remaining++;
    return true;
  }

  reset(): void {
    this.remaining = MAX_HEARTS;
    this.protection = 0;
  }
}
