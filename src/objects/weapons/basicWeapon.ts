import { CylinderGeometry, Group, Mesh, MeshPhongMaterial, Scene, SphereGeometry, Vector3 } from 'three';
import Colors from '../../utils/colors.ts';
import { segmentSphereHitTime } from '../../utils/collision.ts';
import type { Meteor, MeteorField } from '../landscape/meteor.ts';

interface Bullet { mesh: Group; previous: Vector3; age: number }

export class BasicWeapon {
  readonly active = new Set<Bullet>();
  private readonly pool: Bullet[] = [];
  private readonly baseGeometry = new CylinderGeometry(2, 2, 5, 8, 1);
  private readonly headGeometry = new SphereGeometry(2, 10, 10);
  private readonly material = new MeshPhongMaterial({ color: Colors.black, flatShading: true });

  constructor(private readonly scene: Scene) {}

  fire(position: Vector3): void {
    const bullet = this.pool.pop() ?? this.create();
    bullet.mesh.position.copy(position);
    bullet.mesh.position.x += 15;
    bullet.previous.copy(bullet.mesh.position);
    bullet.age = 0;
    this.scene.add(bullet.mesh);
    this.active.add(bullet);
  }

  update(delta: number, meteors: MeteorField, boundary: number): void {
    for (const bullet of this.active) {
      bullet.previous.copy(bullet.mesh.position);
      bullet.mesh.position.x += 200 * delta;
      bullet.age += delta;
      let firstHit: Meteor | undefined;
      let firstTime = Infinity;
      for (const meteor of meteors.active) {
        const previous = meteor.previous;
        const current = meteor.mesh.position;
        const time = segmentSphereHitTime(
          bullet.previous.x - previous.x, bullet.previous.y - previous.y, bullet.previous.z - previous.z,
          bullet.mesh.position.x - current.x, bullet.mesh.position.y - current.y, bullet.mesh.position.z - current.z,
          12,
        );
        if (time !== undefined && time < firstTime) {
          firstTime = time;
          firstHit = meteor;
        }
      }
      if (firstHit) {
        meteors.remove(firstHit);
        this.remove(bullet);
      } else if (bullet.mesh.position.x > boundary || bullet.age > 8) {
        this.remove(bullet);
      }
    }
  }

  dispose(): void {
    for (const bullet of this.active) this.scene.remove(bullet.mesh);
    this.active.clear();
    this.pool.length = 0;
    this.baseGeometry.dispose();
    this.headGeometry.dispose();
    this.material.dispose();
  }

  reset(): void {
    for (const bullet of this.active) this.remove(bullet);
  }

  private create(): Bullet {
    const mesh = new Group();
    mesh.name = 'bullet';
    const base = new Mesh(this.baseGeometry, this.material);
    base.rotation.z = Math.PI / 2;
    const head = new Mesh(this.headGeometry, this.material);
    head.position.x = 3;
    base.castShadow = head.castShadow = true;
    base.receiveShadow = head.receiveShadow = true;
    mesh.add(base, head);
    return { mesh, previous: new Vector3(), age: 0 };
  }

  private remove(bullet: Bullet): void {
    if (!this.active.delete(bullet)) return;
    this.scene.remove(bullet.mesh);
    this.pool.push(bullet);
  }
}
