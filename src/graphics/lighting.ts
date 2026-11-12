import { AmbientLight, DirectionalLight, HemisphereLight, Scene } from 'three';
import Colors from '../utils/colors.ts';

export const SHADOW_MAP_SIZE = 2048;

export function createLighting(scene: Scene): DirectionalLight {
  // Modern Three uses physically correct light intensities; PI preserves r115's
  // legacy direct/ambient brightness with the original linear output palette.
  const hemisphere = new HemisphereLight(0xaaaaaa, 0x000000, 0.5 * Math.PI);
  const ambient = new AmbientLight(Colors.offWhite, 0.5 * Math.PI);
  const sun = new DirectionalLight(0xffffff, 0.4 * Math.PI);
  sun.position.set(150, 500, 350);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -400, right: 400, top: 400, bottom: -400, near: 1, far: 1000 });
  sun.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
  scene.add(hemisphere, ambient, sun);
  return sun;
}
