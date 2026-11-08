/** Earliest intersection of a relative-motion segment with a sphere at origin.
 * Scalar arithmetic avoids temporary vectors in the projectile/meteor hot path.
 */
export function segmentSphereHitTime(
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  radius: number,
): number | undefined {
  const c = ax * ax + ay * ay + az * az - radius * radius;
  if (c <= 0) return 0;
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  const lengthSquared = dx * dx + dy * dy + dz * dz;
  if (lengthSquared < 1e-12) return undefined;
  const dot = ax * dx + ay * dy + az * dz;
  const discriminant = dot * dot - lengthSquared * c;
  if (discriminant < 0) return undefined;
  const time = (-dot - Math.sqrt(discriminant)) / lengthSquared;
  return time >= 0 && time <= 1 ? time : undefined;
}
