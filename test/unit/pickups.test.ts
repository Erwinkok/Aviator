import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Mesh, Scene, Vector3 } from 'three';
import { Health, HIT_PROTECTION_SECONDS } from '../../src/health.ts';
import { RunScore } from '../../src/score.ts';
import { pickupPlan } from '../../src/pickupPlan.ts';
import { PickupField } from '../../src/objects/landscape/pickups.ts';
import { MeteorField } from '../../src/objects/landscape/meteor.ts';
import { AirPlane } from '../../src/objects/vehicles/airplane.ts';
import { FlightProgress, FrameStepper } from '../../src/simulation.ts';
import { seededRandom } from '../../src/utils/utils.ts';
import { disposeTree } from '../../src/utils/resources.ts';

test('repairs restore one heart up to three, preserve protection timing and cannot revive a finished run', () => {
  const h = new Health();
  assert.equal(h.repair(), false);
  h.hit(); h.update(1);
  assert.equal(h.repair(), true);
  assert.equal(h.hearts, 3);
  assert.equal(h.protected, true);
  h.update(0.5);
  assert.equal(h.protected, false);
  for (let i = 0; i < 3; i++) { h.hit(); h.update(HIT_PROTECTION_SECONDS); }
  assert.equal(h.repair(), false);
  assert.equal(h.hearts, 0);
});

test('coins add exactly 25 points each, validate counts, freeze at finish and reset independently of kills', () => {
  const score = new RunScore();
  score.update(10.9, 2, 3);
  assert.equal(score.total, 285);
  assert.equal(score.coinsCollected, 3);
  for (const bad of [-1, NaN, Infinity, 0.5, Number.MAX_VALUE]) score.update(0, 0, bad);
  assert.equal(score.total, 285);
  score.finish(); score.update(1000, 10, 10);
  assert.equal(score.total, 285);
  score.reset();
  assert.equal(score.coinsCollected, 0);
  assert.equal(score.total, 0);
  score.update(0, 0, Number.MAX_SAFE_INTEGER);
  assert.ok(Number.isSafeInteger(score.total));
  assert.ok(score.total <= Number.MAX_SAFE_INTEGER);
});

test('trails offer three clear-route coins or five tighter-route coins; repairs are occasional and placed after the group', () => {
  let repairs = 0;
  for (let cycle = 0; cycle < 30; cycle++) for (let safeLane = 0; safeLane < 3; safeLane++) {
    const plan = pickupPlan(safeLane, cycle);
    const height = [50, 100, 150][safeLane]!;
    assert.equal(plan.filter(p => p.kind === 'coin' && p.height === height).length, 3);
    assert.equal(plan.filter(p => p.kind === 'coin' && p.height !== height).length, 5);
    for (const coin of plan.filter(p => p.kind === 'coin')) {
      assert.ok(coin.height >= 50 && coin.height <= 150);
      const coinRadius = Math.hypot(100, 800 + coin.height);
      for (const blocked of [50, 100, 150].filter(h => h !== height)) {
        const gap = Math.abs(coinRadius - Math.hypot(100, 800 + blocked));
        // A collected coin must never require touching a meteor, even at the edge of both hit spheres.
        assert.ok(gap > 24);
      }
    }
    for (const repair of plan.filter(p => p.kind === 'repair')) {
      repairs++;
      assert.equal(repair.height, height);
      assert.equal(repair.offset, 150);
    }
  }
  assert.equal(repairs, 30); // One in three cycles, across three lanes.
});

test('relative swept pickup contact credits once, including moving aircraft, while misses/expiry give nothing', () => {
  const scene = new Scene(), field = new PickupField(scene);
  field.add('coin', Math.PI / 2, 900);
  field.add('repair', Math.PI / 2, 900);
  const from = new Vector3(-50, 100, 0), to = new Vector3(50, 100, 0);
  assert.deepEqual(field.update(0, 0, from, to), { coins: 1, repairs: 1 });
  assert.deepEqual(field.update(0, 0, from, to), { coins: 0, repairs: 0 });
  field.add('coin', Math.PI / 2, 950);
  assert.deepEqual(field.update(0, 0, from, to), { coins: 0, repairs: 0 });
  field.add('repair', Math.PI + 0.01, 900);
  assert.deepEqual(field.update(0, 0, from, to), { coins: 0, repairs: 0 });
  assert.equal(field.active.size, 1);
  field.dispose();
  assert.equal(scene.children.length, 0);
});

test('pickup pools reset transforms and reuse geometry; teardown disposes every shared resource once', () => {
  const scene = new Scene(), field = new PickupField(scene);
  const first = field.add('coin', 1, 900);
  field.add('coin', 1, 950);
  field.add('repair', 1, 900);
  const resources = new Set<{ addEventListener(type: 'dispose', callback: () => void): void }>();
  scene.traverse(object => { if (object instanceof Mesh) { resources.add(object.geometry); resources.add(object.material); } });
  first.age = 20; first.mesh.rotation.y = 2;
  field.remove(first); field.remove(first);
  const recycled = field.add('coin', 1.5, 920);
  assert.equal(recycled, first);
  assert.equal(recycled.age, 0);
  assert.equal(recycled.mesh.rotation.y, 0);
  field.reset();
  assert.equal(field.active.size, 0);
  assert.equal(scene.children.length, 0);
  let disposed = 0;
  for (const resource of resources) resource.addEventListener('dispose', () => disposed++);
  field.dispose();
  assert.equal(disposed, resources.size);
});

test('natural pickup/meteor cycles are deterministic across refresh rates and keep a bounded field over five minutes', () => {
  function fly(hz: number) {
    const scene = new Scene(), pickups = new PickupField(scene), meteors = new MeteorField(scene, seededRandom(42));
    const progress = new FlightProgress(), stepper = new FrameStepper(), plane = new AirPlane(1280);
    plane.mesh.position.set(-100, 500, 0);
    let maximum = 0;
    for (let frame = 0; frame <= hz * 300; frame++) stepper.advance(frame * 1000 / hz, delta => {
      progress.update(delta, 1.6);
      meteors.spawn(progress.distance, (lane, cycle) => pickups.spawnTrail(lane, cycle));
      meteors.update(progress.speed, delta, plane);
      pickups.update(progress.speed, delta, plane.mesh.position, plane.mesh.position);
      maximum = Math.max(maximum, pickups.active.size);
    });
    assert.ok(maximum <= 24);
    const state = [maximum, ...[...pickups.active].flatMap(p => [p.angle, p.age, p.distance])];
    pickups.dispose(); meteors.dispose(); disposeTree(plane.mesh);
    assert.equal(scene.children.length, 0);
    return state;
  }
  assert.deepEqual(fly(30), fly(60));
  assert.deepEqual(fly(144), fly(60));
});
