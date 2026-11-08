import { BufferAttribute, CylinderGeometry, DynamicDrawUsage, Mesh, MeshPhongMaterial } from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import Colors from '../../utils/colors.ts';
import { TAU, type Random } from '../../utils/utils.ts';

export const SEA_RADIUS = 800;

interface Wave { x: number; y: number; angle: number; amplitude: number; speed: number }

export class Sea {
  readonly mesh: Mesh;
  private readonly waves: Wave[] = [];

  constructor(random: Random = Math.random) {
    const cylinder = new CylinderGeometry(SEA_RADIUS, SEA_RADIUS, 800, 40, 10);
    cylinder.rotateX(-Math.PI / 2);
    // Welding by position preserves the original shared waves at cap/seam edges.
    cylinder.deleteAttribute('normal');
    cylinder.deleteAttribute('uv');
    const geometry = mergeVertices(cylinder);
    cylinder.dispose();
    geometry.computeVertexNormals();
    const positions = geometry.getAttribute('position');
    if (positions instanceof BufferAttribute) positions.setUsage(DynamicDrawUsage);
    for (let i = 0; i < positions.count; i++) {
      this.waves.push({ x: positions.getX(i), y: positions.getY(i), angle: random() * TAU,
        amplitude: 5 + random() * 15, speed: 0.001 + random() * 0.002 });
    }
    geometry.computeBoundingSphere();
    if (geometry.boundingSphere) geometry.boundingSphere.radius += 20;
    const material = new MeshPhongMaterial({ color: Colors.blue, flatShading: true, shininess: 0 });
    this.mesh = new Mesh(geometry, material);
    this.mesh.name = 'waves';
    this.mesh.receiveShadow = true;
    this.mesh.position.y = -SEA_RADIUS;
  }

  update(speed: number, delta: number): void {
    this.mesh.rotation.z = (this.mesh.rotation.z + speed * delta) % TAU;
    const positions = this.mesh.geometry.getAttribute('position');
    for (let i = 0; i < this.waves.length; i++) {
      const wave = this.waves[i];
      if (!wave) continue;
      positions.setXY(i, wave.x + Math.cos(wave.angle) * wave.amplitude, wave.y + Math.sin(wave.angle) * wave.amplitude);
      wave.angle += wave.speed * delta;
    }
    // Flat shading derives current normals in the fragment shader. Upload once;
    // recomputing smooth normals each tick would add work and change the art.
    positions.needsUpdate = true;
  }
}
