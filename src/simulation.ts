export const FIXED_STEP = 1 / 60;
export const MAX_FRAME_DELTA = 0.1;

/** Fixed simulation cadence keeps 60 Hz gameplay identical on fast displays. */
export class FrameStepper {
  private lastTimestamp: number | undefined;
  private accumulator = 0;

  advance(timestamp: number, tick: (delta: number) => void): number {
    if (this.lastTimestamp === undefined) {
      this.lastTimestamp = timestamp;
      return 0;
    }
    this.accumulator += Math.max(0, Math.min(MAX_FRAME_DELTA, (timestamp - this.lastTimestamp) / 1000));
    this.lastTimestamp = timestamp;
    let steps = 0;
    while (this.accumulator + 1e-10 >= FIXED_STEP) {
      tick(FIXED_STEP);
      this.accumulator = Math.max(0, this.accumulator - FIXED_STEP);
      steps++;
    }
    return steps;
  }

  reset(): void {
    this.lastTimestamp = undefined;
    this.accumulator = 0;
  }
}

export class FlightProgress {
  distance = 0;
  speed = 0;
  private baseSpeed = 0.35;
  private targetBaseSpeed = 0.35;
  private speedCheckpoint = 0;

  update(delta: number, planeSpeed: number): void {
    this.distance += this.speed * delta * 50;
    // Crossings, rather than an exact modulo match: never miss a checkpoint.
    const checkpoint = Math.floor(this.distance / 100);
    if (checkpoint > this.speedCheckpoint) {
      this.targetBaseSpeed += (checkpoint - this.speedCheckpoint) * 2 * FIXED_STEP;
      this.speedCheckpoint = checkpoint;
    }
    this.baseSpeed += (this.targetBaseSpeed - this.baseSpeed) * delta * 0.02;
    this.speed = this.baseSpeed * planeSpeed;
  }
}
