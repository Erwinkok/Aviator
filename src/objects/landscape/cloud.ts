import { BoxGeometry, Group, Mesh, MeshPhongMaterial } from 'three';
import type { Random } from '../../utils/utils.ts';

export function createCloud(geometry: BoxGeometry, material: MeshPhongMaterial, random: Random): Group {
  const cloud = new Group();
  cloud.name = 'cloud';
  const count = 3 + Math.floor(random() * 3);
  for (let i = 0; i < count; i++) {
    const scale = 0.1 + random() * 0.9;
    const mesh = new Mesh(geometry, material);
    mesh.position.set(i * 15, random() * 10, random() * 10);
    mesh.rotation.z = random() * Math.PI * 2;
    mesh.rotation.y = random() * Math.PI * 2;
    mesh.scale.setScalar(scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    cloud.add(mesh);
  }
  return cloud;
}
