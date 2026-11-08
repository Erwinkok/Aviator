import { CylinderGeometry, Group, Mesh, MeshPhongMaterial, Scene, SphereGeometry, type Vector3 } from 'three';
import Colors from '../../utils/colors.ts';
import { disposeTree } from '../../utils/resources.ts';
import type { MeteorField } from '../landscape/meteor.ts';

interface Bullet { mesh: Group; age: number }

export class BasicWeapon {
  readonly active = new Set<Bullet>();
  constructor(private readonly scene: Scene) {}

  fire(position: Vector3): void {
    const mesh = new Group();
    mesh.name = 'bullet';
    const material = new MeshPhongMaterial({ color: Colors.black, flatShading: true });
    const base = new Mesh(new CylinderGeometry(2, 2, 5, 8, 1), material);
    base.rotation.z = Math.PI / 2;
    const head = new Mesh(new SphereGeometry(2, 10, 10), material);
    head.position.x = 3;
    base.castShadow = head.castShadow = true;
    base.receiveShadow = head.receiveShadow = true;
    mesh.add(base, head);
    mesh.position.copy(position);
    mesh.position.x += 15;
    this.scene.add(mesh);
    this.active.add({ mesh, age: 0 });
  }

  update(delta: number, meteors: MeteorField, boundary: number): void {
    for (const bullet of this.active) {
      bullet.mesh.position.x += 200 * delta;
      bullet.age += delta;
      for (const meteor of meteors.active) {
        if (bullet.mesh.position.distanceToSquared(meteor.mesh.position) < 144) {
          meteors.remove(meteor);
          this.remove(bullet);
          break;
        }
      }
      if (this.active.has(bullet) && (bullet.mesh.position.x > boundary || bullet.age > 8)) this.remove(bullet);
    }
  }

  dispose(): void { for (const bullet of this.active) this.remove(bullet); }

  private remove(bullet: Bullet): void {
    this.active.delete(bullet);
    this.scene.remove(bullet.mesh);
    disposeTree(bullet.mesh);
  }
}
