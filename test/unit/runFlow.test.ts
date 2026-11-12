import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RunFlow } from '../../src/runFlow.ts';

test('a flight needs Play; pause/resume cannot start or finish an unstarted run', () => {
  const flow = new RunFlow();
  assert.equal(flow.state, 'ready');
  assert.equal(flow.resume(), false);
  assert.equal(flow.pause(), false);
  assert.equal(flow.finish(), false);
  assert.equal(flow.retry(), false);
  assert.equal(flow.state, 'ready');
  assert.equal(flow.play(), true);
  assert.equal(flow.state, 'playing');
  assert.equal(flow.play(), false);
});

test('pausing retains user intent until Resume and cannot restart a run', () => {
  const flow = new RunFlow();
  flow.play();
  for (let cycle = 0; cycle < 3; cycle++) {
    assert.equal(flow.pause(), true);
    assert.equal(flow.state, 'paused');
    assert.equal(flow.pause(), false);
    assert.equal(flow.play(), false);
    assert.equal(flow.finish(), false);
    assert.equal(flow.retry(), false);
    assert.equal(flow.state, 'paused');
    assert.equal(flow.resume(), true);
    assert.equal(flow.state, 'playing');
    assert.equal(flow.resume(), false);
  }
});

test('game over only leaves through Retry, with no accidental Escape/resume restart', () => {
  const flow = new RunFlow();
  flow.play();
  assert.equal(flow.finish(), true);
  assert.equal(flow.state, 'over');
  assert.equal(flow.resume(), false);
  assert.equal(flow.pause(), false);
  assert.equal(flow.play(), false);
  assert.equal(flow.finish(), false);
  assert.equal(flow.state, 'over');
  assert.equal(flow.retry(), true);
  assert.equal(flow.state, 'playing');
  assert.equal(flow.pause(), true);
});
