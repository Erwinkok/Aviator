import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Scene, Vector3 } from 'three';
import { RunScore, PersonalBest, BEST_SCORE_KEY } from '../../src/score.ts';
import { BasicWeapon } from '../../src/objects/weapons/basicWeapon.ts';
import { MeteorField } from '../../src/objects/landscape/meteor.ts';

test('distance scores cumulative whole units and kills add exactly 100 each', () => {
  const score = new RunScore();
  for (const distance of [0.1, 0.4, 0.99]) score.update(distance);
  assert.equal(score.total, 0);
  score.update(1.2);
  assert.equal(score.total, 1);
  score.update(1.9, 2);
  assert.equal(score.total, 201);
  score.update(1.9);
  assert.equal(score.total, 201);
  score.update(24.9, 1);
  assert.equal(score.total, 324);
});

test('invalid/backward updates cannot corrupt points; totals remain safe integers', () => {
  const score = new RunScore();
  score.update(10, 1);
  for (const value of [-10, NaN, Infinity, -Infinity]) score.update(value, value);
  score.update(9, 0.5);
  assert.equal(score.total, 110);
  score.update(Number.MAX_VALUE, Number.MAX_SAFE_INTEGER);
  assert.equal(score.total, Number.MAX_SAFE_INTEGER);
});

test('game over freezes score and retry starts a new independent run', () => {
  const score = new RunScore();
  score.update(25.5, 3);
  score.finish();
  score.update(1000, 10);
  assert.equal(score.total, 325);
  score.reset();
  assert.equal(score.total, 0);
  score.update(2.2, 1);
  assert.equal(score.total, 102);
});

test('combat reports each actual kill once despite duplicate shots, misses and repeated updates', () => {
  const scene = new Scene(), field = new MeteorField(scene), weapon = new BasicWeapon(scene), score = new RunScore();
  const meteor = field.add(0, 900);
  meteor.mesh.position.set(50, 100, 0);
  meteor.previous.copy(meteor.mesh.position);
  weapon.fire(new Vector3(0, 100, 0));
  weapon.fire(new Vector3(0, 100, 0));
  const kills = weapon.update(0.5, field, 1000);
  assert.equal(kills, 1);
  score.update(0, kills);
  assert.equal(score.total, 100);
  assert.equal(weapon.update(1, field, 0), 0);
  assert.equal(weapon.update(1, field, 0), 0);
  assert.equal(field.active.size, 0);
  weapon.dispose(); field.dispose();
});

test('best is cached during play, saved on demand and never overwrites a higher stored record', () => {
  let saved = '50', writes = 0;
  const storage = {
    getItem: (key: string) => { assert.equal(key, BEST_SCORE_KEY); return saved; },
    setItem: (key: string, value: string) => { assert.equal(key, BEST_SCORE_KEY); saved = value; writes++; },
  };
  const best = new PersonalBest(() => storage);
  assert.equal(best.total, 50);
  for (let score = 0; score <= 100; score++) best.observe(score);
  assert.equal(best.total, 100);
  assert.equal(writes, 0);
  best.save();
  assert.equal(saved, '100');
  assert.equal(writes, 1);
  best.observe(10); best.save();
  assert.equal(writes, 1);
  saved = '900'; // Another tab has already saved a better run.
  best.save();
  assert.equal(best.total, 900);
  assert.equal(writes, 1);
  assert.equal(new PersonalBest(() => storage).total, 900);
});

test('missing and malformed stored records are ignored, without accepting unsafe numbers', () => {
  for (const value of [null, '', 'null', '"100"', '12.5', '-1', 'NaN', 'Infinity', '1e5', ' 50 ', '9007199254740992', '{broken']) {
    const best = new PersonalBest(() => ({ getItem: () => value, setItem: () => {} }));
    assert.equal(best.total, 0, String(value));
  }
  for (const value of ['0', '12345', '9007199254740991']) {
    assert.equal(new PersonalBest(() => ({ getItem: () => value, setItem: () => {} })).total, Number(value));
  }
});

test('blocked storage getters and quota failures retain a usable in-memory best', () => {
  const unavailable = new PersonalBest(() => { throw new Error('SecurityError'); });
  unavailable.observe(123);
  unavailable.observe(Infinity);
  unavailable.observe(0.5);
  unavailable.save();
  assert.equal(unavailable.total, 123);
  assert.equal(unavailable.persistent, false);
  const full = new PersonalBest(() => ({ getItem: () => '50', setItem: () => { throw new Error('QuotaExceededError'); } }));
  full.observe(200); full.save();
  assert.equal(full.total, 200);
  assert.equal(full.persistent, false);
});
