import { METEOR_HEIGHTS } from './difficulty.ts';

export type PickupKind = 'coin' | 'repair';
export interface PlannedPickup { kind: PickupKind; height: number; offset: number }

/** Offsets are flight-distance units behind the start of a meteor group. */
export function pickupPlan(safeLane: number, cycle: number): PlannedPickup[] {
  const safe = METEOR_HEIGHTS[safeLane]!;
  const tighter = safeLane === 0 ? 75 : safeLane === 2 ? 125 : cycle % 2 === 0 ? 75 : 125;
  const plan: PlannedPickup[] = [];
  for (let i = 0; i < 3; i++) plan.push({ kind: 'coin', height: safe, offset: i * 18 });
  for (let i = 0; i < 5; i++) plan.push({ kind: 'coin', height: tighter, offset: i * 12 });
  if (cycle % 3 === 2) plan.push({ kind: 'repair', height: safe, offset: 150 });
  return plan;
}
