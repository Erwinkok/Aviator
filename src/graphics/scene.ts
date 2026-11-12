import { Fog, Scene } from 'three';
import Colors from '../utils/colors.ts';

export function createScene(): Scene {
  const scene = new Scene();
  scene.fog = new Fog(Colors.orange, 100, 950);
  return scene;
}
