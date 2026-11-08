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
    const mesh = new Mesh(new TetrahedronGeometry(10, 2),
      new MeshPhongMaterial({ color: Colors.red, shininess: 0, flatShading: true }));
    mesh.name = 'meteor';
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const meteor: Meteor = { mesh, previous: new Vector3(), angle, distance };
    this.position(meteor);
    meteor.previous.copy(mesh.position);
    this.active.add(meteor);
    this.scene.add(mesh);
    return meteor;
  }

  update(speed: number, delta: number, plane: AirPlane): void {
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
        plane.collide(length > 0 ? 5 * dx / length : -5, length > 0 ? 5 * dy / length : 0);
        this.remove(meteor);
      } else if (meteor.angle > Math.PI) {
        this.remove(meteor);
      }
    }
  }

  remove(meteor: Meteor): void {
    if (!this.active.delete(meteor)) return;
    this.scene.remove(meteor.mesh);
    meteor.mesh.geometry.dispose();
    meteor.mesh.material.dispose();
  }

  dispose(): void { for (const meteor of this.active) this.remove(meteor); }

  private interval(): number { return Math.floor(20 + this.random() * 80); }
  private position(meteor: Meteor): void {
    meteor.mesh.position.set(Math.cos(meteor.angle) * meteor.distance, -SEA_RADIUS + Math.sin(meteor.angle) * meteor.distance, 0);
  }
}
