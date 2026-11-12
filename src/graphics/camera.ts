import { PerspectiveCamera } from 'three';
import { normalize } from '../utils/utils.ts';

export class CameraController {
  readonly camera = new PerspectiveCamera(75, 1, 1, 10000);

  constructor(width: number, height: number) {
    this.camera.position.set(0, 100, 200);
    this.resize(width, height);
  }

  update(delta: number, pointerX: number, planeY: number): void {
    const fov = normalize(pointerX, -1, 1, 40, 90);
    if (this.camera.fov !== fov) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
    this.camera.position.y += (planeY - this.camera.position.y) * delta * 0.002;
  }

  resize(width: number, height: number): void {
    this.camera.aspect = Math.max(1, width) / Math.max(1, height);
    // Keep the square viewport's horizontal play area on portrait screens;
    // the legacy camera clipped the entire plane off the left edge on phones.
    this.camera.position.z = 200 / Math.min(1, this.camera.aspect);
    this.camera.updateProjectionMatrix();
  }

  /** Right edge at the gameplay plane (z=0), with a small projectile margin. */
  get projectileBoundary(): number {
    const halfHeight = Math.tan(this.camera.fov * Math.PI / 360) * this.camera.position.z;
    return this.camera.position.x + halfHeight * this.camera.aspect + 20;
  }
}
