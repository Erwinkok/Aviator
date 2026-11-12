import { Mesh, MeshPhongMaterial, Scene, TetrahedronGeometry, Vector3 } from 'three';
import Colors from '../../utils/colors.ts';
import { type Random } from '../../utils/utils.ts';
import { AirPlane, DEFAULT_HEIGHT, HEIGHT_RANGE } from '../vehicles/airplane.ts';
import { SEA_RADIUS } from './sea.ts';

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
  private lastDistance = 0;
  private nextDistance: number;

  constructor(private readonly scene: Scene, private readonly random: Random = Math.random) {
    this.nextDistance = this.interval();
  }

  spawn(distance: number): void {
    if (distance <= this.lastDistance + this.nextDistance) return;
    this.add(-this.random(), SEA_RADIUS + DEFAULT_HEIGHT + (-1 + this.random() * 2) * (HEIGHT_RANGE - 20));
    this.lastDistance = distance;
    this.nextDistance = this.interval();
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
      meteor.angle += speed * delta * 0.6;
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
    this.lastDistance = 0;
    this.nextDistance = this.interval();
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

  private interval(): number { return Math.floor(20 + this.random() * 80); }
  private position(meteor: Meteor): void {
    meteor.mesh.position.set(Math.cos(meteor.angle) * meteor.distance, -SEA_RADIUS + Math.sin(meteor.angle) * meteor.distance, 0);
  }
}
