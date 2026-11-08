import { BoxGeometry, Group, MeshPhongMaterial } from 'three';
import Colors from '../../utils/colors.ts';
import { TAU, type Random } from '../../utils/utils.ts';
import { SEA_RADIUS } from './sea.ts';
import { createCloud } from './cloud.ts';

export class Sky {
  readonly mesh = new Group();
  private readonly clouds: Group[] = [];

  constructor(random: Random = Math.random) {
    this.mesh.name = 'sky';
    this.mesh.position.y = -SEA_RADIUS;
    const geometry = new BoxGeometry(20, 20, 20);
    const material = new MeshPhongMaterial({ color: Colors.white, flatShading: true });
    for (let i = 0; i < 20; i++) {
      const angle = TAU * i / 20;
      const height = SEA_RADIUS + 150 + random() * 200;
      const scale = 1 + random() * 2;
      const cloud = createCloud(geometry, material, random);
      cloud.position.set(Math.cos(angle) * height, Math.sin(angle) * height, -300 - random() * 500);
      cloud.rotation.z = angle + Math.PI / 2;
      cloud.scale.setScalar(scale);
      this.clouds.push(cloud);
      this.mesh.add(cloud);
    }
  }

  update(speed: number, delta: number): void {
    for (const cloud of this.clouds) {
      for (let i = 0; i < cloud.children.length; i++) {
        const block = cloud.children[i];
        if (!block) continue;
        // Mean original per-frame rotation, scaled to elapsed simulation time.
        block.rotation.z += 0.0025 * (i + 1) * delta * 60;
        block.rotation.y += 0.001 * (i + 1) * delta * 60;
      }
    }
    this.mesh.rotation.z = (this.mesh.rotation.z + speed * delta) % TAU;
  }
}
