import { BoxGeometry, CircleGeometry, CylinderGeometry, Group, Mesh, MeshPhongMaterial, Scene, Vector3 } from 'three';
import { METEOR_ANGULAR_SPEED } from '../../difficulty.ts';
import { pickupPlan, type PickupKind } from '../../pickupPlan.ts';
import { segmentSphereHitTime } from '../../utils/collision.ts';
import { SEA_RADIUS } from './sea.ts';

export interface Pickup { mesh: Group; kind: PickupKind; angle: number; distance: number; age: number }
export const PICKUP_RADIUS = 12;

/** Shared low-poly geometry and separate pools keep repeated trails bounded. */
export class PickupField {
  readonly active = new Set<Pickup>();
  private readonly pools: Record<PickupKind, Pickup[]> = { coin: [], repair: [] };
  private readonly coinGeometry = new CylinderGeometry(6, 6, 2, 8).rotateX(Math.PI / 2);
  private readonly stampGeometry = new CircleGeometry(3.4, 8);
  private readonly repairGeometry = new CylinderGeometry(8, 8, 2, 8).rotateX(Math.PI / 2);
  private readonly crossGeometry = new BoxGeometry(3.4, 10, 0.5);
  private readonly gold = new MeshPhongMaterial({ color: 0xf0c45a, flatShading: true, shininess: 30 });
  private readonly stamp = new MeshPhongMaterial({ color: 0xb98135, flatShading: true });
  private readonly green = new MeshPhongMaterial({ color: 0x63ae93, flatShading: true });
  private readonly white = new MeshPhongMaterial({ color: 0xffffff, flatShading: true });

  constructor(private readonly scene: Scene) {}

  spawnTrail(safeLane: number, cycle: number): void {
    for (const item of pickupPlan(safeLane, cycle)) {
      const radius = Math.hypot(100, SEA_RADIUS + item.height);
      this.add(item.kind, Math.acos(270 / radius) - item.offset * METEOR_ANGULAR_SPEED / 50, radius);
    }
  }

  add(kind: PickupKind, angle: number, distance: number): Pickup {
    const pickup = this.pools[kind].pop() ?? this.create(kind);
    pickup.angle = angle;
    pickup.distance = distance;
    pickup.age = 0;
    pickup.mesh.rotation.set(0, 0, 0);
    this.position(pickup);
    this.active.add(pickup);
    this.scene.add(pickup.mesh);
    return pickup;
  }

  update(speed: number, delta: number, previousPlane: Vector3, plane: Vector3): { coins: number; repairs: number } {
    let coins = 0, repairs = 0;
    for (const pickup of this.active) {
      const old = pickup.mesh.position;
      const ax = old.x - previousPlane.x, ay = old.y - previousPlane.y, az = old.z - previousPlane.z;
      pickup.angle += speed * delta * METEOR_ANGULAR_SPEED;
      pickup.age += delta;
      this.position(pickup);
      // Wobble without turning edge-on: the coin/cross stays recognisable.
      pickup.mesh.rotation.y = Math.sin(pickup.age * 3) * 0.35;
      const now = pickup.mesh.position;
      if (segmentSphereHitTime(ax, ay, az, now.x - plane.x, now.y - plane.y, now.z - plane.z, PICKUP_RADIUS) !== undefined) {
        if (pickup.kind === 'coin') coins++; else repairs++;
        this.remove(pickup);
      } else if (pickup.angle > Math.PI) this.remove(pickup);
    }
    return { coins, repairs };
  }

  remove(pickup: Pickup): void {
    if (!this.active.delete(pickup)) return;
    this.scene.remove(pickup.mesh);
    this.pools[pickup.kind].push(pickup);
  }

  reset(): void { for (const pickup of this.active) this.remove(pickup); }

  dispose(): void {
    this.reset();
    this.pools.coin.length = this.pools.repair.length = 0;
    for (const geometry of [this.coinGeometry, this.stampGeometry, this.repairGeometry, this.crossGeometry]) geometry.dispose();
    for (const material of [this.gold, this.stamp, this.green, this.white]) material.dispose();
  }

  private create(kind: PickupKind): Pickup {
    const mesh = new Group();
    mesh.name = `pickup-${kind}`;
    mesh.add(new Mesh(kind === 'coin' ? this.coinGeometry : this.repairGeometry, kind === 'coin' ? this.gold : this.green));
    const mark = new Mesh(kind === 'coin' ? this.stampGeometry : this.crossGeometry, kind === 'coin' ? this.stamp : this.white);
    mark.position.z = 1.3;
    mesh.add(mark);
    if (kind === 'repair') {
      const bar = mark.clone();
      bar.rotation.z = Math.PI / 2;
      mesh.add(bar);
    }
    return { mesh, kind, angle: 0, distance: 0, age: 0 };
  }

  private position(pickup: Pickup): void {
    pickup.mesh.position.set(Math.cos(pickup.angle) * pickup.distance, -SEA_RADIUS + Math.sin(pickup.angle) * pickup.distance, 0);
  }
}
