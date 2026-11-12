import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FrameStepper, FlightProgress, FIXED_STEP } from '../../src/simulation.ts';
import { AirPlane } from '../../src/objects/vehicles/airplane.ts';
import { normalize, seededRandom } from '../../src/utils/utils.ts';
import { disposeTree } from '../../src/utils/resources.ts';

function fly(refreshRate: number) {
  const plane = new AirPlane(1280);
  const progress = new FlightProgress();
  const stepper = new FrameStepper();
  let steps = 0;
  for (let i = 0; i <= refreshRate * 10; i++) {
    steps += stepper.advance(i * 1000 / refreshRate, (delta) => {
      progress.update(delta, plane.speed);
      plane.update(delta, { x: 0.4, y: 0.7 });
    });
  }
  const state = [plane.mesh.position.x, plane.mesh.position.y, plane.propellor.rotation.x, progress.distance];
  disposeTree(plane.mesh);
  return { steps, state };
}

test('flight and propeller are identical after 10 seconds at 30, 60 and 144 Hz', () => {
  const reference = fly(60);
  assert.equal(reference.steps, 600);
  assert.deepEqual(fly(30), reference);
  assert.deepEqual(fly(144), reference);
});

test('large/negative frame gaps are bounded and reset ignores time spent hidden', () => {
  const stepper = new FrameStepper();
  assert.equal(stepper.advance(1000, () => {}), 0);
  assert.equal(stepper.advance(61000, () => {}), 6);
  assert.equal(stepper.advance(60000, () => {}), 0);
  stepper.reset();
  assert.equal(stepper.advance(900000, () => assert.fail('must not simulate background time')), 0);
});

test('crossed speed checkpoints are applied even when the distance skips exact multiples', () => {
  const progress = new FlightProgress();
  progress.distance = 99.9;
  progress.speed = 600;
  progress.update(FIXED_STEP, 1.4);
  assert.equal(progress.distance, 599.9);
  assert.ok(progress.speed > 0.35 * 1.4);
  const speed = progress.speed;
  progress.update(FIXED_STEP, 1.4);
  assert.ok(progress.speed > speed);
  assert.ok(Number.isFinite(progress.speed));
});

test('normalization clamps pointer input and seeded scenes reproduce', () => {
  assert.equal(normalize(-10, -1, 1, 0, 100), 0);
  assert.equal(normalize(10, -1, 1, 0, 100), 100);
  assert.equal(normalize(0, -1, 1, 0, 100), 50);
  const a = seededRandom(42), b = seededRandom(42);
  assert.deepEqual(Array.from({ length: 100 }, a), Array.from({ length: 100 }, b));
});
