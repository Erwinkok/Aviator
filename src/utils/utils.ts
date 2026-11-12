export function normalize(value: number, min: number, max: number, targetMin: number, targetMax: number): number {
  const clamped = Math.max(min, Math.min(max, value));
  return targetMin + ((clamped - min) / (max - min)) * (targetMax - targetMin);
}

export type Random = () => number;
export const TAU = Math.PI * 2;

/** Seeded source for reproducible tests/profiles; normal play uses Math.random. */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
