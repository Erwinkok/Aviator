import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Scene } from 'three';
import { difficultyAt, OPENING_DISTANCE, ENCOUNTER_DISTANCE, RECOVERY_DISTANCE, METEOR_HEIGHTS, METEOR_ANGULAR_SPEED } from '../../src/difficulty.ts';
import { MeteorField } from '../../src/objects/landscape/meteor.ts';
import { CameraController } from '../../src/graphics/camera.ts';
import { seededRandom } from '../../src/utils/utils.ts';
import { AirPlane } from '../../src/objects/vehicles/airplane.ts';
import { disposeTree } from '../../src/utils/resources.ts';
import { FlightProgress, FrameStepper } from '../../src/simulation.ts';

test('speed and density rise smoothly to a fixed ceiling, with a slower opening', () => {
  assert.equal(difficultyAt(0).baseSpeed, 0.28);
  let previous = difficultyAt(0);
  for (let distance = 1; distance <= 10000; distance++) {
    const current = difficultyAt(distance);
    assert.ok(current.baseSpeed >= previous.baseSpeed && current.baseSpeed <= 0.42 + 1e-10);
    assert.ok(current.spacing <= previous.spacing && current.spacing >= 26);
    assert.ok(current.baseSpeed - previous.baseSpeed < 0.0001);
    previous = current;
  }
  assert.deepEqual(difficultyAt(2400), difficultyAt(1e9));
  assert.equal(difficultyAt(599).paired, false);
  assert.equal(difficultyAt(600).paired, true);
});

test('opening and recovery spawn nothing; distance jumps never release a catch-up burst', () => {
  const field = new MeteorField(new Scene(), seededRandom(1));
  field.spawn(OPENING_DISTANCE - 0.01);
  assert.equal(field.active.size, 0);
  field.spawn(OPENING_DISTANCE);
  assert.equal(field.active.size, 1);
  field.reset();
  field.spawn(OPENING_DISTANCE + ENCOUNTER_DISTANCE);
  assert.equal(field.active.size, 0);
  field.spawn(OPENING_DISTANCE + ENCOUNTER_DISTANCE + RECOVERY_DISTANCE - 0.01);
  assert.equal(field.active.size, 0);
  field.spawn(1e9);
  assert.ok(field.active.size <= 2);
  const count = field.active.size;
  for (let i = 0; i < 100; i++) field.spawn(1e9);
  assert.equal(field.active.size, count);
  field.reset();
  field.spawn(0);
  assert.equal(field.active.size, 0);
  field.spawn(OPENING_DISTANCE);
  assert.equal(field.active.size, 1);
  field.dispose();
});

test('seeded groups leave a clear route across the steering area and real arrival recovery gaps', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const field = new MeteorField(new Scene(), seededRandom(seed));
    let previousLastArrival = -Infinity;
    let previousSafe: number | undefined;
    for (let cycle = 0; cycle < 20; cycle++) {
      const start = OPENING_DISTANCE + cycle * (ENCOUNTER_DISTANCE + RECOVERY_DISTANCE);
      const radii: number[] = [], arrivals: number[] = [];
      for (let offset = 0; offset < ENCOUNTER_DISTANCE + RECOVERY_DISTANCE; offset++) {
        field.spawn(start + offset);
        assert.ok(offset < ENCOUNTER_DISTANCE || field.active.size === 0);
        assert.ok(field.active.size <= 2);
        for (const meteor of field.active) {
          radii.push(meteor.distance);
          arrivals.push(start + offset + (Math.acos(-100 / meteor.distance) - meteor.angle) * 50 / METEOR_ANGULAR_SPEED);
        }
        for (const meteor of field.active) field.remove(meteor);
      }
      assert.ok(arrivals.length >= 3);
      assert.ok(Math.min(...arrivals) - previousLastArrival > 80, 'at least 2.38 seconds at maximum speed between groups at the aircraft');
      previousLastArrival = Math.max(...arrivals);
      const safe = METEOR_HEIGHTS.findIndex((height) => radii.every((radius) => {
        // Include horizontal steering extremes and visual clearance beyond the 12-unit hit radius.
        return [-150, -100, -52.5].every((x) => Math.abs(Math.sqrt(radius * radius - x * x) - 800 - height) > 30);
      }));
      assert.ok(safe >= 0, `seed ${seed}, cycle ${cycle} needs a clear route`);
      if (previousSafe !== undefined) assert.ok(Math.abs(safe - previousSafe) <= 1);
      previousSafe = safe;
    }
    field.dispose();
  }
});

test('maximum-speed meteors give at least 0.7 seconds of visible warning on desktop and portrait', () => {
  for (const [width, height] of [[1280, 720], [390, 844], [320, 568]]) {
    const camera = new CameraController(width!, height!);
    for (const pointer of [-1, -0.5, 0, 0.5, 1]) {
      camera.update(0, pointer, 100);
      const planeX = -52.5 + (Math.max(-0.75, Math.min(0.75, pointer)) + 0.75) / 1.5 * (-150 + 52.5);
      const planeSpeed = pointer <= -0.5 ? 1.2 : pointer >= 0.5 ? 1.6 : 1.4 + pointer * 0.4;
      for (const height of METEOR_HEIGHTS) {
        const radius = Math.hypot(100, 800 + height);
        const visibleX = Math.min(270, camera.projectileBoundary - 30);
        const field = new MeteorField(new Scene());
        const plane = new AirPlane(width!);
        plane.mesh.position.set(planeX, Math.sqrt(radius * radius - planeX * planeX) - 800, 0);
        const meteor = field.add(Math.acos(visibleX / radius), radius);
        for (let tick = 0; tick < 42; tick++) {
          field.update(0.42 * planeSpeed, 1 / 60, plane, () => assert.fail('contact before 0.7 seconds of warning'));
        }
        assert.ok(meteor.mesh.position.x > planeX + 12, `${width}px / pointer ${pointer}: needs more warning`);
        field.dispose(); disposeTree(plane.mesh);
      }
    }
  }
});

test('full paced fields reproduce at 30/60/144 Hz and retain bounded shared resources over long runs', () => {
  function fly(hz: number) {
    const scene = new Scene(), field = new MeteorField(scene, seededRandom(42));
    const plane = new AirPlane(1280), progress = new FlightProgress(), stepper = new FrameStepper();
    plane.mesh.position.set(-100, 500, 0); // Keep this lifetime/cadence check independent of damage.
    const geometries = new Set();
    let maximum = 0;
    for (let frame = 0; frame <= hz * 300; frame++) {
      stepper.advance(frame * 1000 / hz, (delta) => {
        progress.update(delta, 1.6);
        field.spawn(progress.distance);
        field.update(progress.speed, delta, plane);
        maximum = Math.max(maximum, field.active.size);
        for (const meteor of field.active) geometries.add(meteor.mesh.geometry);
      });
    }
    assert.ok(progress.distance > 7000);
    assert.equal(geometries.size, 1);
    assert.ok(maximum < 24);
    assert.equal(scene.children.length, field.active.size);
    const result = [progress.distance, progress.speed, maximum, ...[...field.active].flatMap((meteor) => meteor.mesh.position.toArray())];
    field.dispose(); disposeTree(plane.mesh);
    assert.equal(scene.children.length, 0);
    return result;
  }
  const reference = fly(60);
  assert.deepEqual(fly(30), reference);
  assert.deepEqual(fly(144), reference);
});
