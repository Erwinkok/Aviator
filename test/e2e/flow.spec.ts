import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function load(page: Page, play = true) {
  await page.goto('http://127.0.0.1:4174/test/harness.html');
  await page.waitForFunction(() => window.aviatorTest?.game.renderer.info.render.calls > 0);
  if (play) await page.getByRole('button', { name: 'Play', exact: true }).click();
}

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const g = window.aviatorTest.game;
    return {
      distance: g.progress.distance, score: g.score.total, hearts: g.health.hearts, protected: g.health.protected,
      plane: g.plane.mesh.position.toArray(), propeller: g.plane.propellor.rotation.x,
      sea: g.sea.mesh.rotation.z, sky: g.sky.mesh.rotation.z,
      bullets: [...g.weapon.active].map((b) => [b.age, ...b.mesh.position.toArray()]),
      meteors: [...g.meteors.active].map((m) => m.mesh.position.toArray()),
    };
  });
}

test('opening Play screen renders the scene but freezes simulation and firing until keyboard Play', async ({ page }, info) => {
  await load(page, false);
  await expect(page.getByRole('dialog', { name: 'Aviator', exact: true })).toBeVisible();
  await expect(page.locator('.flight-controls')).toContainText('drag to steer');
  await expect(page.locator('.flight-controls')).toContainText('Space');
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeFocused();
  const before = await snapshot(page);
  expect(await page.evaluate(() => window.aviatorTest.game.camera.camera.fov)).toBe(65);
  await page.evaluate(() => {
    window.aviatorTest.game.tick(1);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  expect(await snapshot(page)).toEqual(before);
  await page.screenshot({ path: info.outputPath('play-desktop.png') });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.progress.distance)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.aviatorTest.game.camera.camera.fov)).toBe(65);
});

test('Pause freezes the complete active run and Resume continues without resetting it', async ({ page }, info) => {
  await load(page);
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.health.hit();
    game.weapon.fire(game.plane.mesh.position);
    game.meteors.add(-0.5, 900);
    game.tick(0);
  });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Paused', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeFocused();
  const before = await snapshot(page);
  await page.evaluate(() => {
    window.aviatorTest.game.tick(2);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
  });
  await page.waitForTimeout(250);
  expect(await snapshot(page)).toEqual(before);
  await page.screenshot({ path: info.outputPath('pause-desktop.png') });
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.progress.distance)).toBeGreaterThan(before.distance);
  expect(await page.evaluate(() => window.aviatorTest.game.health.hearts)).toBe(before.hearts);
  await expect(page.locator('#world')).toBeFocused();
});

test('Esc toggles only active runs, ignores key repeat/editing and Space on Resume cannot fire', async ({ page }) => {
  await load(page);
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', repeat: true })));
  expect(await page.evaluate(() => window.aviatorTest.game.flow.state)).toBe('playing');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Paused', exact: true })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', repeat: true })));
  expect(await page.evaluate(() => window.aviatorTest.game.flow.state)).toBe('paused');
  await page.keyboard.press('Space');
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(await page.evaluate(() => window.aviatorTest.game.weapon.active.size)).toBe(0);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => window.aviatorTest.game.flow.state)).toBe('playing');
  await page.evaluate(() => {
    const input = document.createElement('textarea');
    input.id = 'editing-check';
    document.body.append(input);
    input.focus();
  });
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => window.aviatorTest.game.flow.state)).toBe('playing');
});

test('manual pause survives visibility, cached-page events and real WebGL loss/restoration', async ({ page }) => {
  await load(page);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const before = await snapshot(page);
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    window.aviatorTest.attachPageLifecycle(game);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.evaluate(async () => {
    const game = window.aviatorTest.game;
    const extension = game.renderer.getContext().getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('Missing WebGL loss extension');
    window.aviatorTest.restoreContext = () => extension.restoreContext();
    const lost = new Promise<void>((resolve) => game.renderer.domElement.addEventListener('webglcontextlost', () => resolve(), { once: true }));
    extension.loseContext();
    await lost;
  });
  // Restore in a separate browser task, after the loss event has completed.
  // Chrome disallows restoration from the loss-dispatch microtask itself.
  await page.evaluate(async () => {
    const game = window.aviatorTest.game;
    const restored = new Promise<void>((resolve) => game.renderer.domElement.addEventListener('webglcontextrestored', () => resolve(), { once: true }));
    window.aviatorTest.restoreContext?.();
    await restored;
  });
  await page.waitForTimeout(150);
  expect(await snapshot(page)).toEqual(before);
  await expect(page.getByRole('dialog', { name: 'Paused', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.progress.distance)).toBeGreaterThan(before.distance);
});

test('Game over reports actual distance and projectile kills; Retry clears totals and Esc cannot restart', async ({ page }, info) => {
  await load(page);
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.stop(); game.meteors.reset(); game.weapon.reset();
    game.plane.mesh.position.set(-100, 100, 0);
    for (let shot = 0; shot < 3; shot++) {
      const { x, y } = game.plane.mesh.position;
      game.meteors.add(Math.atan2(y + 800, x + 15), Math.hypot(x + 15, y + 800));
      game.weapon.fire(game.plane.mesh.position);
      game.tick(0);
    }
    game.progress.distance = 123.9;
    for (let hit = 0; hit < 3; hit++) {
      game.health.update(1.5);
      const { x, y } = game.plane.mesh.position;
      game.meteors.add(Math.atan2(y + 800, x), Math.hypot(x, y + 800));
      game.tick(0);
    }
    game.renderer.render(game.scene, game.camera.camera);
  });
  await expect(page.getByRole('dialog', { name: 'Game over', exact: true })).toBeVisible();
  await expect(page.locator('.final-score')).toHaveText('Score 423');
  await expect(page.locator('.final-distance')).toHaveText('123');
  await expect(page.locator('.final-meteors')).toHaveText('3');
  expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual([0, 0]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
  expect(await page.locator('#world').evaluate((world) => [world.scrollLeft, world.scrollTop])).toEqual([0, 0]);
  await page.screenshot({ path: info.outputPath('summary-desktop.png') });
  await page.evaluate(() => window.addEventListener('click', () => window.aviatorTest.game.stop(), { once: true }));
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  expect(await page.evaluate(() => {
    const game = window.aviatorTest.game;
    return [game.flow.state, game.score.total, game.score.distanceTravelled, game.score.meteorsDestroyed, game.best.total];
  })).toEqual(['playing', 0, 0, 0, 423]);
  await expect(page.locator('.final-distance')).toHaveText('0');
  await expect(page.locator('.final-meteors')).toHaveText('0');
});

test('phone Play/Pause/Resume work by touch without steering from control taps', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await load(page, false);
  await page.screenshot({ path: info.outputPath('play-phone.png') });
  await page.getByRole('button', { name: 'Play', exact: true }).tap();
  const before = await page.evaluate(() => ({ ...window.aviatorTest.game.input.position }));
  await page.getByRole('button', { name: 'Pause', exact: true }).tap();
  expect(await page.evaluate(() => window.aviatorTest.game.input.position)).toEqual(before);
  await expect(page.getByRole('dialog', { name: 'Paused', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('pause-phone.png') });
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    const button = await page.getByRole('button', { name: 'Resume', exact: true }).boundingBox();
    expect(button && button.height >= 44 && button.y >= 0 && button.y + button.height <= viewport.height).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  }
  await page.getByRole('button', { name: 'Resume', exact: true }).tap();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.progress.distance)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
  await context.close();
});
