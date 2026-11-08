import { BoxGeometry, DynamicDrawUsage, Group, InstancedMesh, Matrix4, MeshPhongMaterial, Sphere, Vector3 } from 'three';
import Colors from '../../utils/colors.ts';
import { TAU, type Random } from '../../utils/utils.ts';
import { SEA_RADIUS } from './sea.ts';
import { createCloud } from './cloud.ts';

export class Sky {
  readonly mesh = new Group();
  readonly blocks: InstancedMesh;
  private readonly clouds: Group[] = [];
  private readonly matrix = new Matrix4();

  constructor(random: Random = Math.random) {
    this.mesh.name = 'sky';
    this.mesh.position.y = -SEA_RADIUS;
    const geometry = new BoxGeometry(20, 20, 20);
    const material = new MeshPhongMaterial({ color: Colors.white, flatShading: true });
    let count = 0;
    for (let i = 0; i < 20; i++) {
      const angle = TAU * i / 20;
      const height = SEA_RADIUS + 150 + random() * 200;
      const scale = 1 + random() * 2;
      const cloud = createCloud(geometry, material, random);
      cloud.position.set(Math.cos(angle) * height, Math.sin(angle) * height, -300 - random() * 500);
      cloud.rotation.z = angle + Math.PI / 2;
      cloud.scale.setScalar(scale);
      cloud.updateMatrix();
      this.clouds.push(cloud);
      count += cloud.children.length;
    }
    this.blocks = new InstancedMesh(geometry, material, count);
    this.blocks.name = 'cloud-blocks';
    this.blocks.castShadow = true;
    this.blocks.receiveShadow = true;
    this.blocks.instanceMatrix.setUsage(DynamicDrawUsage);
    // Conservative bounds cover the whole rotating cloud ring, including blocks
    // at the largest random scale. Avoid recomputing per-instance bounds per tick.
    this.blocks.boundingSphere = new Sphere(new Vector3(0, 0, -550), 1600);
    this.mesh.add(this.blocks);
    this.writeMatrices(0);
  }

  update(speed: number, delta: number): void {
    this.writeMatrices(delta);
    this.mesh.rotation.z = (this.mesh.rotation.z + speed * delta) % TAU;
  }

  private writeMatrices(delta: number): void {
    let index = 0;
    for (const cloud of this.clouds) {
      for (let i = 0; i < cloud.children.length; i++) {
        const block = cloud.children[i];
        if (!block) continue;
        block.rotation.z += 0.0025 * (i + 1) * delta * 60;
        block.rotation.y += 0.001 * (i + 1) * delta * 60;
        block.updateMatrix();
        this.matrix.multiplyMatrices(cloud.matrix, block.matrix);
        this.blocks.setMatrixAt(index++, this.matrix);
      }
    }
    this.blocks.instanceMatrix.needsUpdate = true;
  }
}
