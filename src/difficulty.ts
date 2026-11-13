/** Distance is simulation distance, so pauses cannot advance the challenge. */
export const OPENING_DISTANCE = 60;
export const ENCOUNTER_DISTANCE = 120;
export const RECOVERY_DISTANCE = 90;
export const METEOR_HEIGHTS = [50, 100, 150] as const;
export const METEOR_ANGULAR_SPEED = 0.3;

export function difficultyAt(distance: number) {
  const progress = Math.max(0, Math.min(1, distance / 2400));
  // Smoothstep starts gently and reaches a fixed ceiling after about two minutes.
  const ramp = progress * progress * (3 - 2 * progress);
  return {
    baseSpeed: 0.28 + 0.14 * ramp,
    spacing: 48 - 22 * ramp,
    paired: distance >= 600,
  };
}

export function encounterAt(distance: number) {
  const offset = Math.max(0, distance - OPENING_DISTANCE);
  const cycleLength = ENCOUNTER_DISTANCE + RECOVERY_DISTANCE;
  const cycle = Math.floor(offset / cycleLength);
  const start = OPENING_DISTANCE + cycle * cycleLength;
  return { cycle, start, recovering: distance < OPENING_DISTANCE || distance - start >= ENCOUNTER_DISTANCE };
}
