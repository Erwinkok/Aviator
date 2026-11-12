import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InstancedMesh, Matrix4, Mesh, Scene, Vector3 } from 'three';
import { BasicWeapon } from '../../src/objects/weapons/basicWeapon.ts';
import { MeteorField } from '../../src/objects/landscape/meteor.ts';
import { Sky } from '../../src/objects/landscape/sky.ts';
import { segmentSphereHitTime } from '../../src/utils/collision.ts';
import { seededRandom } from '../../src/utils/utils.ts';
import { disposeTree } from '../../src/utils/resources.ts';

function target(field: MeteorField, x: number, y = 100, z = 0) {
  const meteor = field.add(0, 900);
  meteor.mesh.position.set(x, y, z);
  meteor.previous.copy(meteor.mesh.position);
  return meteor;
}

test('swept collision detects crossing, initial overlap, tangent, misses and zero motion', () => {
  assert.equal(segmentSphereHitTime(-20, 0, 0, 20, 0, 0, 10), 0.25);
  assert.equal(segmentSphereHitTime(0, 0, 0, 100, 0, 0, 10), 0);
  assert.equal(segmentSphereHitTime(-20, 10, 0, 20, 10, 0, 10), 0.5);
  assert.equal(segmentSphereHitTime(-20, 11, 0, 20, 11, 0, 10), undefined);
  assert.equal(segmentSphereHitTime(20, 0, 0, 20, 0, 0, 10), undefined);
  assert.equal(segmentSphereHitTime(20, 0, 0, 100, 0, 0, 10), undefined);
});

test('a fast shot cannot tunnel through a meteor between update endpoints', () => {
  const scene = new Scene(), field = new MeteorField(scene), weapon = new BasicWeapon(scene);
  target(field, 50);
  weapon.fire(new Vector3(0, 100, 0));
  weapon.update(0.5, field, 1000);
  assert.equal(field.active.size, 0);
  assert.equal(weapon.active.size, 0);
  weapon.dispose(); field.dispose();
});

test('sweep handles a meteor crossing the projectile path during the same tick', () => {
  const scene = new Scene(), field = new MeteorField(scene), weapon = new BasicWeapon(scene);
  const meteor = target(field, 50, 150);
  meteor.previous.set(50, 50, 0);
  weapon.fire(new Vector3(0, 100, 0));
  weapon.update(0.35, field, 1000);
  assert.equal(field.active.size, 0);
  assert.equal(weapon.active.size, 0);
  weapon.dispose(); field.dispose();
});

test('only the nearest hit is removed, independent of meteor insertion order', () => {
  const scene = new Scene(), field = new MeteorField(scene), weapon = new BasicWeapon(scene);
  const far = target(field, 75);
  const near = target(field, 40);
  weapon.fire(new Vector3(0, 100, 0));
  weapon.update(0.5, field, 1000);
  assert.equal(field.active.has(near), false);
  assert.equal(field.active.has(far), true);
  assert.equal(weapon.active.size, 0);
  weapon.dispose(); field.dispose();
});

test('projectile pool reuses objects and shared geometry without disposal per shot', () => {
  const scene = new Scene(), field = new MeteorField(scene), weapon = new BasicWeapon(scene);
  weapon.fire(new Vector3());
  const first = [...weapon.active][0];
  assert.ok(first);
  const base = first.mesh.children[0];
  assert.ok(base instanceof Mesh);
  let disposed = 0;
  base.geometry.addEventListener('dispose', () => disposed++);
  weapon.update(1 / 60, field, 0);
  for (let i = 0; i < 100; i++) {
    weapon.fire(new Vector3());
    assert.equal([...weapon.active][0], first);
    assert.equal(first.age, 0);
    weapon.update(1 / 60, field, 0);
  }
  assert.equal(disposed, 0);
  assert.equal(scene.children.length, 0);
  weapon.dispose(); field.dispose();
  assert.equal(disposed, 1);
});

test('meteor pool reuses/reset objects and shares one geometry across active meteors', () => {
  const scene = new Scene(), field = new MeteorField(scene);
  const first = target(field, 20);
  const second = target(field, 100);
  assert.equal(first.mesh.geometry, second.mesh.geometry);
  assert.equal(first.mesh.material, second.mesh.material);
  first.mesh.rotation.x = 2;
  field.remove(first);
  field.remove(first);
  const recycled = field.add(0.5, 950);
  assert.equal(recycled, first);
  assert.equal(recycled.mesh.rotation.x, 0);
  assert.deepEqual(recycled.previous.toArray(), recycled.mesh.position.toArray());
  field.dispose();
  assert.equal(scene.children.length, 0);
});

test('all cloud blocks render through one instanced mesh and retain independent motion', () => {
  const sky = new Sky(seededRandom(42));
  assert.equal(sky.mesh.children.length, 1);
  assert.ok(sky.blocks instanceof InstancedMesh);
  assert.ok(sky.blocks.count >= 60 && sky.blocks.count <= 100);
  const before = new Matrix4(), after = new Matrix4();
  sky.blocks.getMatrixAt(0, before);
  sky.update(0.49, 1 / 60);
  sky.blocks.getMatrixAt(0, after);
  assert.notDeepEqual(before.elements, after.elements);
  assert.ok(after.elements.every(Number.isFinite));
  let disposals = 0;
  sky.blocks.addEventListener('dispose', () => disposals++);
  disposeTree(sky.mesh);
  assert.equal(disposals, 1);
});
