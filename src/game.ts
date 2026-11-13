import { Vector3, type WebGLRenderer } from 'three';
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
import { PersonalBest, RunScore } from './score.ts';
import { RunFlow } from './runFlow.ts';
import { PickupField } from './objects/landscape/pickups.ts';

export class Game {
  readonly scene = createScene();
  readonly progress = new FlightProgress();
  readonly health = new Health();
  readonly score = new RunScore();
  readonly best = new PersonalBest();
  readonly flow = new RunFlow();
  readonly camera: CameraController;
  readonly plane: AirPlane;
  readonly sea: Sea;
  readonly sky: Sky;
  readonly meteors: MeteorField;
  readonly weapon: BasicWeapon;
  readonly pickups: PickupField;
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
  private readonly previousPlane = new Vector3();
  private readonly onEncounter = (safeLane: number, cycle: number): void => this.pickups.spawnTrail(safeLane, cycle);

  constructor(private readonly surface: HTMLElement, random: Random = Math.random) {
    this.renderer = createRenderer(surface);
    this.camera = new CameraController(surface.clientWidth, surface.clientHeight);
    this.sun = createLighting(this.scene);
    this.plane = new AirPlane(surface.clientWidth);
    this.plane.mesh.position.set(-100, 100, 0);
    this.camera.update(0, 0, 100);
    this.sea = new Sea(random);
    this.sky = new Sky(random);
    this.meteors = new MeteorField(this.scene, random);
    this.weapon = new BasicWeapon(this.scene);
    this.pickups = new PickupField(this.scene);
    this.scene.add(this.plane.mesh, this.sea.mesh, this.sky.mesh);
    this.input = new InputHandler(surface, () => {
      if (this.running && this.flow.state === 'playing' && !document.hidden && !this.contextLost) this.weapon.fire(this.plane.mesh.position);
    });
    surface.tabIndex = 0;
    surface.setAttribute('aria-label', 'Aviator flight');
    this.healthView = new HealthView(surface, {
      play: () => this.play(), pause: () => this.pause(), resume: () => this.resume(), retry: () => this.retry(),
    });
    this.updateScoreView();
    this.healthView.update(this.health, this.flow.state);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(surface);
    const options = { signal: this.controller.signal };
    window.addEventListener('keydown', (event) => {
      if (event.code !== 'Escape' || event.repeat || this.disposed) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      if (this.flow.state === 'playing') { event.preventDefault(); this.pause(); }
      else if (this.flow.state === 'paused') { event.preventDefault(); this.resume(); }
    }, options);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.saveBest();
      this.syncLoop();
    }, options);
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
    if (this.disposed) return;
    this.saveBest();
    this.running = false;
    this.syncLoop();
  }

  tick(delta: number): void {
    if (this.disposed || this.health.gameOver || this.flow.state !== 'playing') return;
    this.health.update(delta);
    this.progress.update(delta, this.plane.speed);
    this.previousPlane.copy(this.plane.mesh.position);
    this.plane.update(delta, this.input.position);
    this.camera.update(delta, this.input.position.x, this.plane.mesh.position.y);
    this.sea.update(this.progress.speed, delta);
    this.sky.update(this.progress.speed, delta);
    this.meteors.spawn(this.progress.distance, this.onEncounter);
    this.meteors.update(this.progress.speed, delta, this.plane, this.onHit);
    // A lethal collision ends scoring before any remaining bullets can hit.
    const destroyed = this.health.gameOver ? 0 : this.weapon.update(delta, this.meteors, this.camera.projectileBoundary);
    const collected = this.health.gameOver ? { coins: 0, repairs: 0 } : this.pickups.update(this.progress.speed, delta, this.previousPlane, this.plane.mesh.position);
    let repaired = 0;
    for (let i = 0; i < collected.repairs; i++) if (this.health.repair()) repaired++;
    this.healthView.advanceFeedback(delta);
    if (collected.coins || collected.repairs) this.healthView.showPickups(collected.coins, repaired, collected.repairs > repaired);
    this.score.update(this.progress.distance, destroyed, collected.coins);
    this.best.observe(this.score.total);
    if (this.health.gameOver) {
      this.score.finish();
      this.flow.finish();
      this.best.save();
    }
    this.updateScoreView();
    this.healthView.update(this.health, this.flow.state);
  }

  play(): void {
    if (this.disposed || !this.flow.play()) return;
    this.continueFlight();
  }

  pause(): void {
    if (this.disposed || !this.flow.pause()) return;
    this.saveBest();
    this.healthView.update(this.health, this.flow.state);
    this.syncLoop();
  }

  resume(): void {
    if (this.disposed || !this.flow.resume()) return;
    this.continueFlight();
  }

  retry(): void {
    if (this.disposed || !this.health.gameOver || !this.flow.retry()) return;
    this.health.reset();
    this.score.reset();
    this.progress.reset();
    this.meteors.reset();
    this.weapon.reset();
    this.pickups.reset();
    this.healthView.clearFeedback();
    this.input.position.x = this.input.position.y = 0;
    this.plane.reset(this.surface.clientWidth);
    this.camera.camera.position.y = 100;
    this.camera.update(0, 0, 100);
    this.updateScoreView();
    this.continueFlight();
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
    this.pickups.dispose();
    disposeTree(this.scene);
    this.sun.shadow.dispose();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private syncLoop(): void {
    this.stepper.reset();
    const animate = this.running && this.flow.state === 'playing' && !document.hidden && !this.contextLost;
    this.renderer.setAnimationLoop(animate ? this.frame : null);
    if (!animate && !this.disposed && !document.hidden && !this.contextLost) {
      this.renderer.render(this.scene, this.camera.camera);
    }
  }

  private continueFlight(): void {
    this.healthView.update(this.health, this.flow.state);
    this.surface.focus({ preventScroll: true });
    this.start();
  }

  private updateScoreView(): void {
    this.healthView.updateScore(this.score.total, this.best.total, this.best.persistent,
      this.score.distanceTravelled, this.score.meteorsDestroyed, this.score.coinsCollected);
  }

  private saveBest(): void {
    if (this.disposed) return;
    this.best.save();
    this.updateScoreView();
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
    this.syncLoop();
  }
}
