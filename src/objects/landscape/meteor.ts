import { Mesh, MeshPhongMaterial, Scene, TetrahedronGeometry, Vector3 } from 'three';
import Colors from '../../utils/colors.ts';
import { type Random } from '../../utils/utils.ts';
import { AirPlane } from '../vehicles/airplane.ts';
import { SEA_RADIUS } from './sea.ts';
import { difficultyAt, encounterAt, METEOR_HEIGHTS, METEOR_ANGULAR_SPEED, OPENING_DISTANCE, ENCOUNTER_DISTANCE, RECOVERY_DISTANCE } from '../../difficulty.ts';

const SPAWN_X = 270;

export interface Meteor {
  mesh: Mesh<TetrahedronGeometry, MeshPhongMaterial>;
  previous: Vector3;
  angle: number;
  distance: number;
}

export class MeteorField {
  readonly active = new Set<Meteor>();
  private readonly geometry = new TetrahedronGeometry(10, 2);
  private readonly material = new MeshPhongMaterial({ color: Colors.red, shininess: 0, flatShading: true });
  private readonly pool: Meteor[] = [];
  private nextDistance = OPENING_DISTANCE;
  private cycle = -1;
  private safeLane = 1;
  private row = 0;

  constructor(private readonly scene: Scene, private readonly random: Random = Math.random) {}

  spawn(distance: number, onEncounter?: (safeLane: number, cycle: number) => void): void {
    if (distance < this.nextDistance) return;
    const encounter = encounterAt(distance);
    if (encounter.recovering) {
      this.nextDistance = encounter.start + ENCOUNTER_DISTANCE + RECOVERY_DISTANCE;
      return;
    }
    if (this.cycle !== encounter.cycle) {
      // Keep one clear lane through the whole group. New groups move it by at
      // most one lane, with a recovery gap in which to reposition.
      this.safeLane = Math.max(0, Math.min(2, this.safeLane + (this.random() < 0.5 ? -1 : 1)));
      this.cycle = encounter.cycle;
      this.row = 0;
      onEncounter?.(this.safeLane, this.cycle);
    }
    const difficulty = difficultyAt(distance);
    const blocked = [0, 1, 2].filter((lane) => lane !== this.safeLane);
    const lanes = difficulty.paired && this.row % 2 === 1 ? blocked : [blocked[this.row % 2]!];
    for (const lane of lanes) {
      // Same starting X and fixed radial lanes keep arrivals in readable rows;
      // no random angular offset that can collapse the recovery gap.
      const radius = Math.hypot(100, SEA_RADIUS + METEOR_HEIGHTS[lane]!);
      this.add(Math.acos(SPAWN_X / radius), radius);
    }
    this.row++;
    // No catch-up loop: suspension or a distance jump cannot produce a burst.
    this.nextDistance = Math.min(distance + difficulty.spacing, encounter.start + ENCOUNTER_DISTANCE);
  }

  add(angle: number, distance: number): Meteor {
    const meteor = this.pool.pop() ?? this.create();
    meteor.angle = angle;
    meteor.distance = distance;
    meteor.mesh.rotation.set(0, 0, 0);
    this.position(meteor);
    meteor.previous.copy(meteor.mesh.position);
    this.active.add(meteor);
    this.scene.add(meteor.mesh);
    return meteor;
  }

  update(speed: number, delta: number, plane: AirPlane, onHit: () => boolean = () => true): void {
    for (const meteor of this.active) {
      meteor.previous.copy(meteor.mesh.position);
      meteor.angle += speed * delta * METEOR_ANGULAR_SPEED;
      this.position(meteor);
      meteor.mesh.rotation.z += 0.05 * delta * 60;
      meteor.mesh.rotation.y += 0.05 * delta * 60;
      const dx = plane.mesh.position.x - meteor.mesh.position.x;
      const dy = plane.mesh.position.y - meteor.mesh.position.y;
      const dz = plane.mesh.position.z - meteor.mesh.position.z;
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      if (distanceSquared < 144) {
        const length = Math.sqrt(distanceSquared);
        // Exact overlaps must never inject NaN into the plane and camera.
        if (onHit()) plane.collide(length > 0 ? 5 * dx / length : -5, length > 0 ? 5 * dy / length : 0);
        this.remove(meteor);
      } else if (meteor.angle > Math.PI) {
        this.remove(meteor);
      }
    }
  }

  remove(meteor: Meteor): void {
    if (!this.active.delete(meteor)) return;
    this.scene.remove(meteor.mesh);
    this.pool.push(meteor);
  }

  reset(): void {
    for (const meteor of this.active) this.remove(meteor);
    this.nextDistance = OPENING_DISTANCE;
    this.cycle = -1;
    this.safeLane = 1;
    this.row = 0;
  }

  dispose(): void {
    for (const meteor of this.active) this.scene.remove(meteor.mesh);
    this.active.clear();
    this.pool.length = 0;
    this.geometry.dispose();
    this.material.dispose();
  }

  private create(): Meteor {
    const mesh = new Mesh(this.geometry, this.material);
    mesh.name = 'meteor';
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return { mesh, previous: new Vector3(), angle: 0, distance: 0 };
  }

  private position(meteor: Meteor): void {
    meteor.mesh.position.set(Math.cos(meteor.angle) * meteor.distance, -SEA_RADIUS + Math.sin(meteor.angle) * meteor.distance, 0);
  }
}
