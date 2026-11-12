import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BufferAttribute, Mesh, Scene, Vector3 } from 'three';
import { AirPlane } from '../../src/objects/vehicles/airplane.ts';
import { Sea } from '../../src/objects/landscape/sea.ts';
import { Sky } from '../../src/objects/landscape/sky.ts';
import { MeteorField } from '../../src/objects/landscape/meteor.ts';
import { BasicWeapon } from '../../src/objects/weapons/basicWeapon.ts';
import { CameraController } from '../../src/graphics/camera.ts';
import { disposeTree } from '../../src/utils/resources.ts';
import { seededRandom } from '../../src/utils/utils.ts';

const STEP = 1 / 60;

test('migrated cabin retains every tapered rear corner of the original model', () => {
  const plane = new AirPlane(1280);
  const cabin = plane.mesh.getObjectByName('cabin');
  assert.ok(cabin instanceof Mesh);
  const positions = cabin.geometry.getAttribute('position');
  const rear = new Set<string>();
  for (let i = 0; i < positions.count; i++) {
    if (positions.getX(i) === -40) rear.add(`${positions.getY(i)},${positions.getZ(i)}`);
  }
  assert.deepEqual(rear, new Set(['15,-5', '15,5', '5,-5', '5,5']));
  disposeTree(plane.mesh);
});

test('sea welds seam/cap vertices and marks exactly one upload per simulation tick', () => {
  const sea = new Sea(seededRandom(1));
  const positions = sea.mesh.geometry.getAttribute('position');
  assert.equal(positions.count, 442);
  assert.ok(positions instanceof BufferAttribute);
  const version = positions.version;
  const oldX = positions.getX(0);
  sea.update(0.5, STEP);
  assert.equal(positions.version, version + 1);
  assert.notEqual(positions.getX(0), oldX);
  assert.ok((sea.mesh.geometry.boundingSphere?.radius ?? 0) > 800);
  disposeTree(sea.mesh);
});

test('static pointer does not recalculate camera projection every tick', () => {
  const camera = new CameraController(1280, 720);
  let updates = 0;
  const original = camera.camera.updateProjectionMatrix.bind(camera.camera);
  camera.camera.updateProjectionMatrix = () => { updates++; original(); };
  camera.update(STEP, 0, 100);
  for (let i = 0; i < 600; i++) camera.update(STEP, 0, 100);
  assert.equal(updates, 1);
  camera.resize(390, 844);
  assert.equal(updates, 2);
  assert.equal(camera.camera.aspect, 390 / 844);
  assert.ok(Math.abs(camera.projectileBoundary - (Math.tan(65 * Math.PI / 360) * 200 + 20)) < 1e-8);
});

test('meteor starts on its flight path and exits the scene after passing the plane', () => {
  const scene = new Scene();
  const field = new MeteorField(scene, seededRandom(1));
  const plane = new AirPlane(1280);
  const meteor = field.add(-0.5, 900);
  assert.notDeepEqual(meteor.mesh.position.toArray(), [0, 0, 0]);
  meteor.angle = Math.PI + 0.01;
  field.update(0, STEP, plane);
  assert.equal(field.active.size, 0);
  assert.equal(scene.children.length, 0);
  field.dispose();
  disposeTree(plane.mesh);
});

test('exact plane/meteor overlap produces a finite collision response', () => {
  const scene = new Scene();
  const field = new MeteorField(scene);
  const plane = new AirPlane(1280);
  const meteor = field.add(Math.PI / 2, 900);
  plane.mesh.position.copy(meteor.mesh.position);
  field.update(0, STEP, plane);
  assert.equal(field.active.size, 0);
  for (let i = 0; i < 120; i++) plane.update(STEP, { x: 0, y: 0 });
  assert.ok(plane.mesh.position.toArray().every(Number.isFinite));
  field.dispose();
  disposeTree(plane.mesh);
});

test('one projectile destroys one meteor and cannot hit again after removal', () => {
  const scene = new Scene();
  const field = new MeteorField(scene);
  const weapon = new BasicWeapon(scene);
  for (let i = 0; i < 2; i++) field.add(Math.PI / 2, 900).mesh.position.set(18, 100, 0);
  weapon.fire(new Vector3(0, 100, 0));
  weapon.update(STEP, field, 1000);
  assert.equal(weapon.active.size, 0);
  assert.equal(field.active.size, 1);
  weapon.dispose();
  field.dispose();
});

test('offscreen and expired projectiles leave both the scene and active collection', () => {
  const scene = new Scene();
  const field = new MeteorField(scene);
  const weapon = new BasicWeapon(scene);
  weapon.fire(new Vector3(0, 100, 0));
  weapon.update(STEP, field, 10);
  assert.equal(weapon.active.size, 0);
  assert.equal(scene.children.length, 0);
  weapon.fire(new Vector3(0, 100, 0));
  for (let i = 0; i < 500; i++) weapon.update(STEP, field, 100000);
  assert.equal(weapon.active.size, 0);
  weapon.dispose();
  field.dispose();
});

test('scene teardown disposes shared cloud and aircraft resources once', () => {
  const scene = new Scene();
  const plane = new AirPlane(1280);
  const sky = new Sky(seededRandom(1));
  scene.add(plane.mesh, sky.mesh);
  const resources = new Set<{ addEventListener(type: 'dispose', listener: () => void): void }>();
  scene.traverse((node) => {
    if (node instanceof Mesh) {
      resources.add(node.geometry);
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) resources.add(material);
    }
  });
  let disposals = 0;
  for (const resource of resources) resource.addEventListener('dispose', () => disposals++);
  disposeTree(scene);
  assert.equal(disposals, resources.size);
});

test('portrait camera keeps the plane in view at left, centre and right steering extremes', () => {
  const camera = new CameraController(390, 844);
  for (const x of [-1, 0, 1]) {
    const plane = new AirPlane(390);
    for (let i = 0; i < 600; i++) plane.update(STEP, { x, y: 0 });
    camera.update(STEP, x, 100);
    camera.camera.updateMatrixWorld();
    const projected = plane.mesh.position.clone().project(camera.camera);
    assert.ok(projected.x > -0.9 && projected.x < 0.9, `plane must remain visible for pointer x=${x}`);
    disposeTree(plane.mesh);
  }
});
