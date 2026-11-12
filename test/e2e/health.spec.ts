import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function load(page: Page) {
  await page.goto('http://127.0.0.1:4174/test/harness.html');
  await page.waitForFunction(() => window.aviatorTest?.game.renderer.info.render.calls > 0);
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.stop();
    game.meteors.reset();
    game.plane.mesh.position.set(-100, 100, 0);
  });
}

/** Arrange real meteor contacts, exercising Game.tick, collision, health and UI. */
async function collide(page: Page, count = 1) {
  await page.evaluate((count) => {
    const game = window.aviatorTest.game;
    const { x, y } = game.plane.mesh.position;
    for (let i = 0; i < count; i++) game.meteors.add(Math.atan2(y + 800, x), Math.hypot(x, y + 800));
    game.tick(0);
    game.renderer.render(game.scene, game.camera.camera);
  }, count);
}

async function endRun(page: Page) {
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.aviatorTest.game.health.update(1.5));
    await collide(page);
  }
  await expect(page.getByRole('dialog', { name: 'Game over' })).toBeVisible();
}

test('production page shows three filled hearts and no game-over screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('3 of 3 hearts');
  await expect(page.locator('.heart:not(.is-empty)')).toHaveCount(3);
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(await page.evaluate(() => 'aviatorTest' in window)).toBe(false);
});

test('meteor hits update hearts, protect against simultaneous contacts and expire after active time', async ({ page }, info) => {
  await load(page);
  await collide(page, 3);
  await expect(page.getByRole('status')).toHaveText('2 of 3 hearts · Protected');
  await expect(page.locator('.heart.is-empty')).toHaveCount(1);
  expect(await page.evaluate(() => window.aviatorTest.game.meteors.active.size)).toBe(0);
  await collide(page);
  await expect(page.getByRole('status')).toHaveText('2 of 3 hearts · Protected');
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    // Tick active simulation rather than waiting on wall time.
    for (let i = 0; i < 90; i++) game.tick(1 / 60);
  });
  await expect(page.getByRole('status')).toHaveText('2 of 3 hearts');
  await collide(page);
  await expect(page.getByRole('status')).toHaveText('1 of 3 hearts · Protected');
  await page.screenshot({ path: info.outputPath('health-desktop.png') });
});

test('game over freezes flight and firing through page lifecycle events; keyboard Retry resets the run', async ({ page }, info) => {
  await load(page);
  await endRun(page);
  await expect(page.getByRole('status')).toHaveText('0 of 3 hearts');
  await expect(page.getByRole('button', { name: 'Retry' })).toBeFocused();
  await page.screenshot({ path: info.outputPath('game-over-desktop.png') });
  const stopped = await page.evaluate(() => {
    const game = window.aviatorTest.game;
    const before = game.progress.distance;
    game.tick(1);
    game.start();
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    document.dispatchEvent(new Event('visibilitychange'));
    return before;
  });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
  // Dispatch to body so Space tests firing without activating Retry.
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true })));
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => [window.aviatorTest.game.progress.distance, window.aviatorTest.game.weapon.active.size])).toEqual([stopped, 0]);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('3 of 3 hearts');
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.progress.distance)).toBeGreaterThan(0);
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.weapon.active.size)).toBe(1);
});

test('real animation-loop collision ends the run and stops after rendering the final frame', async ({ page }) => {
  await load(page);
  await collide(page);
  await page.evaluate(() => window.aviatorTest.game.health.update(1.5));
  await collide(page);
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.health.update(1.5);
    const { x, y } = game.plane.mesh.position;
    game.meteors.add(Math.atan2(y + 800, x), Math.hypot(x, y + 800));
    game.start();
  });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.waitForTimeout(100);
  const before = await page.evaluate(() => window.aviatorTest.game.progress.distance);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.aviatorTest.game.progress.distance)).toBe(before);
});

test('phone Retry works by touch, stays within viewport, and repeated runs retain one HUD/canvas', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await load(page);
  for (let run = 0; run < 3; run++) {
    await endRun(page);
    const box = await page.getByRole('button', { name: 'Retry' }).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    if (run === 0) await page.screenshot({ path: info.outputPath('game-over-phone.png') });
    await page.getByRole('button', { name: 'Retry' }).tap();
    await expect(page.getByRole('status')).toHaveText('3 of 3 hearts');
    await page.evaluate(() => window.aviatorTest.game.stop());
    expect(await page.evaluate(() => [window.aviatorTest.game.meteors.active.size, window.aviatorTest.game.weapon.active.size])).toEqual([0, 0]);
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(page.locator('.health-hud')).toHaveCount(1);
    await expect(page.locator('.game-over')).toHaveCount(1);
  }
  await page.evaluate(() => window.aviatorTest.game.dispose());
  await expect(page.locator('.health-hud, .game-over, canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
  await context.close();
});

test('hidden page time does not consume hit protection', async ({ page }) => {
  await load(page);
  await collide(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    window.aviatorTest.game.start();
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(1600);
  expect(await page.evaluate(() => window.aviatorTest.game.health.protected)).toBe(true);
  await expect(page.getByRole('status')).toHaveText('2 of 3 hearts · Protected');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByRole('status')).toHaveText('2 of 3 hearts', { timeout: 5000 });
});
