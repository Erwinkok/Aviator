import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Scene, Vector3 } from 'three';
import { Health, HIT_PROTECTION_SECONDS } from '../../src/health.ts';
import { FlightProgress } from '../../src/simulation.ts';
import { AirPlane } from '../../src/objects/vehicles/airplane.ts';
import { MeteorField } from '../../src/objects/landscape/meteor.ts';
import { BasicWeapon } from '../../src/objects/weapons/basicWeapon.ts';
import { disposeTree } from '../../src/utils/resources.ts';

test('three damaging hits end the run; protected contacts and further hits cost no hearts', () => {
  const health = new Health();
  assert.equal(health.hearts, 3);
  for (const remaining of [2, 1, 0]) {
    assert.equal(health.hit(), true);
    assert.equal(health.hearts, remaining);
    assert.equal(health.hit(), false);
    health.update(HIT_PROTECTION_SECONDS);
  }
  assert.equal(health.gameOver, true);
  assert.equal(health.protected, false);
  health.update(60);
  assert.equal(health.hit(), false);
  assert.equal(health.hearts, 0);
});

test('protection lasts exactly 1.5 seconds of simulation, including fixed-step rounding', () => {
  const health = new Health();
  health.hit();
  health.update(-20);
  health.update(0);
  for (let i = 0; i < 89; i++) health.update(1 / 60);
  assert.equal(health.protected, true);
  assert.equal(health.hit(), false);
  health.update(1 / 60);
  assert.equal(health.protected, false);
  assert.equal(health.hit(), true);
});

test('reset restores full health and clears protection after a hit or game over', () => {
  const health = new Health();
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let hit = 0; hit < 3; hit++) {
      health.hit();
      health.update(HIT_PROTECTION_SECONDS);
    }
    health.reset();
    assert.equal(health.hearts, 3);
    assert.equal(health.gameOver, false);
    assert.equal(health.protected, false);
    health.hit();
    health.reset();
    assert.equal(health.hit(), true);
    health.reset();
  }
});

test('simultaneous meteor contacts damage and knock back once, removing every contacted obstacle', () => {
  const scene = new Scene(), field = new MeteorField(scene), plane = new AirPlane(1280), health = new Health();
  plane.mesh.position.set(0, 100, 0);
  for (let i = 0; i < 3; i++) field.add(Math.PI / 2, 900);
  let knockbacks = 0;
  plane.collide = () => { knockbacks++; };
  field.update(0, 0, plane, () => health.hit());
  assert.equal(health.hearts, 2);
  assert.equal(knockbacks, 1);
  assert.equal(field.active.size, 0);
  field.add(Math.PI / 2, 900);
  field.update(0, 0, plane, () => health.hit());
  assert.equal(health.hearts, 2);
  assert.equal(knockbacks, 1);
  health.update(HIT_PROTECTION_SECONDS);
  field.add(Math.PI / 2, 900);
  field.update(0, 0, plane, () => health.hit());
  assert.equal(health.hearts, 1);
  assert.equal(knockbacks, 2);
  field.dispose(); disposeTree(plane.mesh);
});

test('retry components discard previous speed, collision impulses and active objects while keeping pools reusable', () => {
  const progress = new FlightProgress(), reference = new FlightProgress();
  progress.distance = 5000;
  progress.speed = 100;
  progress.update(1 / 60, 1.4);
  progress.reset();
  for (let i = 0; i < 120; i++) { progress.update(1 / 60, 1.4); reference.update(1 / 60, 1.4); }
  assert.equal(progress.distance, reference.distance);
  assert.equal(progress.speed, reference.speed);

  const scene = new Scene(), field = new MeteorField(scene, () => 0), weapon = new BasicWeapon(scene);
  field.spawn(1000);
  const meteor = [...field.active][0];
  weapon.fire(new Vector3());
  field.reset(); weapon.reset();
  assert.equal(scene.children.length, 0);
  assert.equal(field.active.size, 0);
  assert.equal(weapon.active.size, 0);
  field.spawn(21);
  assert.equal(field.active.size, 0, 'Retry restores the quiet opening');
  field.spawn(60);
  assert.equal([...field.active][0], meteor);

  const plane = new AirPlane(1280), fresh = new AirPlane(390);
  plane.collide(5, 5);
  for (let i = 0; i < 10; i++) plane.update(1 / 60, { x: 1, y: 1 });
  plane.reset(390);
  for (let i = 0; i < 120; i++) {
    plane.update(1 / 60, { x: 0, y: 0 }); fresh.update(1 / 60, { x: 0, y: 0 });
  }
  assert.deepEqual(plane.mesh.position.toArray(), fresh.mesh.position.toArray());
  assert.deepEqual(plane.mesh.rotation.toArray(), fresh.mesh.rotation.toArray());
  assert.equal(plane.propellor.rotation.x, fresh.propellor.rotation.x);
  weapon.dispose(); field.dispose(); disposeTree(plane.mesh); disposeTree(fresh.mesh);
});
