import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function harness(page: Page) {
  await page.goto('http://127.0.0.1:4174/test/harness.html');
  await page.waitForFunction(() => window.aviatorTest?.game.renderer.info.render.calls > 0);
}

test('production page starts WebGL without errors and retains the original full-screen scene', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('#error')).toBeHidden();
  await page.waitForTimeout(2500);
  expect(await page.locator('canvas').boundingBox()).toEqual({ x: 0, y: 0, width: 1280, height: 720 });
  await page.screenshot({ path: info.outputPath('aviator-desktop.png') });
  expect(errors).toEqual([]);
});

test('mouse steers the plane and releasing Space fires from its current position', async ({ page }) => {
  await harness(page);
  await page.mouse.move(320, 100);
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.plane.mesh.position.y)).toBeGreaterThan(135);
  await page.keyboard.down('Space');
  expect(await page.evaluate(() => window.aviatorTest.game.weapon.active.size)).toBe(0);
  await page.keyboard.up('Space');
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.weapon.active.size)).toBe(1);
  const shot = await page.evaluate(() => {
    const game = window.aviatorTest.game;
    const bullet = [...game.weapon.active][0];
    return { y: bullet?.mesh.position.y, planeY: game.plane.mesh.position.y };
  });
  expect(Math.abs((shot.y ?? 0) - shot.planeY)).toBeLessThan(5);
});

test('resizing updates canvas and projection without recreating the game', async ({ page }) => {
  await harness(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.camera.camera.aspect)).toBeCloseTo(390 / 844);
  expect(await page.locator('canvas').boundingBox()).toEqual({ x: 0, y: 0, width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('touch drag steers on a phone without moving the document', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await harness(page);
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 100, y: 500 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 300, y: 150 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.input.position.y)).toBeGreaterThan(0.5);
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.plane.mesh.position.y)).toBeGreaterThan(130);
  expect(await page.evaluate(() => [window.scrollX, window.scrollY, document.documentElement.scrollWidth])).toEqual([0, 0, 390]);
  await page.screenshot({ path: info.outputPath('aviator-phone.png') });
  await context.close();
});

test('hidden pages pause simulation and resume without catching up background time', async ({ page }) => {
  await harness(page);
  const before = await page.evaluate(() => {
    const game = window.aviatorTest.game;
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    return game.progress.distance;
  });
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.aviatorTest.game.progress.distance)).toBe(before);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.progress.distance)).toBeGreaterThan(before);
});

test('WebGL context loss pauses safely and rendering resumes after restoration', async ({ page }) => {
  await harness(page);
  const before = await page.evaluate(() => {
    const game = window.aviatorTest.game;
    const gl = game.renderer.getContext();
    const extension = gl.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('WEBGL_lose_context is required for this check');
    window.aviatorTest.restoreContext = () => extension.restoreContext();
    extension.loseContext();
    return game.progress.distance;
  });
  await page.waitForTimeout(300);
  const paused = await page.evaluate(() => window.aviatorTest.game.progress.distance);
  expect(paused - before).toBeLessThan(2);
  await page.evaluate(() => window.aviatorTest.restoreContext?.());
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.progress.distance), { timeout: 10000 }).toBeGreaterThan(paused);
});

test('disposing and recreating a game leaves one canvas and no duplicate fire handlers', async ({ page }) => {
  await harness(page);
  await page.evaluate(() => {
    const state = window.aviatorTest;
    const old = state.game;
    old.dispose();
    old.dispose();
    state.game = state.create();
    state.game.start();
  });
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.weapon.active.size)).toBe(1);
  await page.evaluate(() => window.aviatorTest.game.dispose());
  await expect(page.locator('canvas')).toHaveCount(0);
});
