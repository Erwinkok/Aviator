export const METEOR_POINTS = 100;
export const COIN_POINTS = 25;
export const BEST_SCORE_KEY = 'aviator.best-score.v1';

/** Whole flight distance, projectile kills and collected coins contribute points. */
export class RunScore {
  private distance = 0;
  private kills = 0;
  private coins = 0;
  private finished = false;

  get total(): number { return Math.min(Number.MAX_SAFE_INTEGER, this.distance + this.kills * METEOR_POINTS + this.coins * COIN_POINTS); }
  get distanceTravelled(): number { return this.distance; }
  get meteorsDestroyed(): number { return this.kills; }
  get coinsCollected(): number { return this.coins; }

  update(distance: number, destroyedMeteors = 0, collectedCoins = 0): void {
    if (this.finished) return;
    if (Number.isFinite(distance)) this.distance = Math.min(Number.MAX_SAFE_INTEGER, Math.max(this.distance, Math.floor(distance)));
    if (Number.isSafeInteger(destroyedMeteors) && destroyedMeteors > 0) {
      this.kills = Math.min(Math.floor(Number.MAX_SAFE_INTEGER / METEOR_POINTS), this.kills + destroyedMeteors);
    }
    if (Number.isSafeInteger(collectedCoins) && collectedCoins > 0) {
      this.coins = Math.min(Math.floor(Number.MAX_SAFE_INTEGER / COIN_POINTS), this.coins + collectedCoins);
    }
  }

  finish(): void { this.finished = true; }

  reset(): void {
    this.distance = this.kills = this.coins = 0;
    this.finished = false;
  }
}

type ScoreStorage = Pick<Storage, 'getItem' | 'setItem'>;

function storedScore(value: string | null): number {
  if (value === null || !/^(0|[1-9]\d*)$/.test(value)) return 0;
  const score = Number(value);
  return Number.isSafeInteger(score) ? score : 0;
}

/** Keep gameplay usable when storage is blocked, corrupt or full. */
export class PersonalBest {
  private value = 0;
  private storageAvailable = true;

  constructor(private readonly storage: () => ScoreStorage = () => window.localStorage) {
    try { this.value = storedScore(this.storage().getItem(BEST_SCORE_KEY)); }
    catch { this.storageAvailable = false; }
  }

  get total(): number { return this.value; }
  get persistent(): boolean { return this.storageAvailable; }

  observe(score: number): void {
    if (Number.isSafeInteger(score) && score > this.value) this.value = score;
  }

  /** Save at game over or suspension, keeping disk writes out of the frame loop. */
  save(): void {
    try {
      const storage = this.storage();
      const saved = storedScore(storage.getItem(BEST_SCORE_KEY));
      this.value = Math.max(this.value, saved);
      if (this.value > saved) storage.setItem(BEST_SCORE_KEY, String(this.value));
      this.storageAvailable = true;
    } catch { this.storageAvailable = false; }
  }
}
