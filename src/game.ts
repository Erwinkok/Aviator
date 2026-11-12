import type { WebGLRenderer } from 'three';
import { CameraController } from './graphics/camera.ts';
import { createLighting } from './graphics/lighting.ts';
import { createRenderer } from './graphics/renderer.ts';
import { createScene } from './graphics/scene.ts';
import { InputHandler } from './input/inputHandler.ts';
import { AirPlane } from './objects/vehicles/airplane.ts';
import { Sea } from './objects/landscape/sea.ts';
import { Sky } from './objects/landscape/sky.ts';
import { MeteorField } from './objects/landscape/meteor.ts';
import { BasicWeapon } from './objects/weapons/basicWeapon.ts';
import { FlightProgress, FrameStepper } from './simulation.ts';
import { disposeTree } from './utils/resources.ts';
import type { Random } from './utils/utils.ts';
import { Health } from './health.ts';
import { HealthView } from './healthView.ts';

export class Game {
  readonly scene = createScene();
  readonly progress = new FlightProgress();
  readonly health = new Health();
  readonly camera: CameraController;
  readonly plane: AirPlane;
  readonly sea: Sea;
  readonly sky: Sky;
  readonly meteors: MeteorField;
  readonly weapon: BasicWeapon;
  readonly renderer: WebGLRenderer;
  readonly input: InputHandler;
  private readonly stepper = new FrameStepper();
  private readonly controller = new AbortController();
  private readonly sun;
  private readonly observer: ResizeObserver;
  private disposed = false;
  private running = false;
  private contextLost = false;
  private readonly healthView: HealthView;
  private readonly onHit = (): boolean => this.health.hit();

  constructor(private readonly surface: HTMLElement, random: Random = Math.random) {
    this.renderer = createRenderer(surface);
    this.camera = new CameraController(surface.clientWidth, surface.clientHeight);
    this.sun = createLighting(this.scene);
    this.plane = new AirPlane(surface.clientWidth);
    this.sea = new Sea(random);
    this.sky = new Sky(random);
    this.meteors = new MeteorField(this.scene, random);
    this.weapon = new BasicWeapon(this.scene);
    this.scene.add(this.plane.mesh, this.sea.mesh, this.sky.mesh);
    this.input = new InputHandler(surface, () => {
      if (this.running && !this.health.gameOver && !document.hidden && !this.contextLost) this.weapon.fire(this.plane.mesh.position);
    });
    this.healthView = new HealthView(surface, () => this.retry());
    this.healthView.update(this.health);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(surface);
    const options = { signal: this.controller.signal };
    document.addEventListener('visibilitychange', () => this.syncLoop(), options);
    this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.contextLost = true;
      this.syncLoop();
    }, options);
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      this.contextLost = false;
      this.syncLoop();
    }, options);
  }

  start(): void {
    if (this.disposed) return;
    this.running = true;
    this.syncLoop();
  }

  stop(): void {
    this.running = false;
    this.syncLoop();
  }

  tick(delta: number): void {
    if (this.disposed || this.health.gameOver) return;
    this.health.update(delta);
    this.progress.update(delta, this.plane.speed);
    this.plane.update(delta, this.input.position);
    this.camera.update(delta, this.input.position.x, this.plane.mesh.position.y);
    this.sea.update(this.progress.speed, delta);
    this.sky.update(this.progress.speed, delta);
    this.meteors.spawn(this.progress.distance);
    this.meteors.update(this.progress.speed, delta, this.plane, this.onHit);
    this.weapon.update(delta, this.meteors, this.camera.projectileBoundary);
    this.healthView.update(this.health);
  }

  retry(): void {
    if (this.disposed || !this.health.gameOver) return;
    this.health.reset();
    this.progress.reset();
    this.meteors.reset();
    this.weapon.reset();
    this.input.position.x = this.input.position.y = 0;
    this.plane.reset(this.surface.clientWidth);
    this.camera.camera.position.y = 100;
    this.camera.update(0, 0, 100);
    this.healthView.update(this.health);
    this.start();
  }

  dispose(): void {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
    this.observer.disconnect();
    this.controller.abort();
    this.input.dispose();
    this.healthView.dispose();
    this.weapon.dispose();
    this.meteors.dispose();
    disposeTree(this.scene);
    this.sun.shadow.dispose();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private syncLoop(): void {
    this.stepper.reset();
    this.renderer.setAnimationLoop(this.running && !this.health.gameOver && !document.hidden && !this.contextLost ? this.frame : null);
  }

  private readonly frame = (timestamp: number): void => {
    this.stepper.advance(timestamp, (delta) => this.tick(delta));
    this.renderer.render(this.scene, this.camera.camera);
    // Stop after rendering the final collision; resetting the stepper mid-tick
    // would corrupt its accumulator when several ticks share one frame.
    if (this.health.gameOver) this.syncLoop();
  };

  private resize(): void {
    const width = Math.max(1, this.surface.clientWidth);
    const height = Math.max(1, this.surface.clientHeight);
    this.renderer.setSize(width, height);
    this.camera.resize(width, height);
  }
}
