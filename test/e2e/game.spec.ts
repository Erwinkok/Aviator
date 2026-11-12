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
  await page.evaluate(() => {
    // Freeze after the existing input listener fires, so both positions are sampled
    // at release time rather than after the plane moves between Playwright calls.
    window.addEventListener('keyup', () => window.aviatorTest.game.stop(), { once: true });
  });
  await page.keyboard.up('Space');
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.weapon.active.size)).toBe(1);
  const shot = await page.evaluate(() => {
    const game = window.aviatorTest.game;
    const bullet = [...game.weapon.active][0];
    return { y: bullet?.mesh.position.y, planeY: game.plane.mesh.position.y };
  });
  expect(shot.y).toBe(shot.planeY);
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
  await expect.poll(() => page.evaluate(() => {
    const game = window.aviatorTest.game;
    return game.plane.mesh.position.clone().project(game.camera.camera).x;
  })).toBeGreaterThan(-0.9);
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

test('repeated rendered firing bursts keep GPU geometry counts stable', async ({ page }) => {
  await harness(page);
  const counts = await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.stop();
    game.plane.mesh.position.set(0, 100, 0);
    game.meteors.spawn = () => {};
    const counts: number[] = [];
    for (let round = 0; round < 3; round++) {
      for (let shot = 0; shot < 40; shot++) {
        game.weapon.fire(game.plane.mesh.position);
        for (let i = 0; i < 5; i++) game.weapon.update(1 / 60, game.meteors, 300);
        game.renderer.render(game.scene, game.camera.camera);
      }
      for (let i = 0; i < 600; i++) game.weapon.update(1 / 60, game.meteors, 300);
      game.renderer.render(game.scene, game.camera.camera);
      counts.push(game.renderer.info.memory.geometries);
    }
    if (game.weapon.active.size !== 0) throw new Error('Shots did not drain');
    return counts;
  });
  expect(counts).toHaveLength(3);
  expect(new Set(counts).size).toBe(1);
  expect(counts[0]).toBeLessThanOrEqual(16);
});

test('a projectile crossing a meteor removes both from the rendered scene', async ({ page }) => {
  await harness(page);
  const result = await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.stop();
    game.plane.mesh.position.set(0, 100, 0);
    const meteor = game.meteors.add(0, 900);
    meteor.mesh.position.set(50, 100, 0);
    meteor.previous.copy(meteor.mesh.position);
    game.weapon.fire(game.plane.mesh.position);
    game.weapon.update(0.5, game.meteors, 1000);
    game.renderer.render(game.scene, game.camera.camera);
    return { meteors: game.meteors.active.size, bullets: game.weapon.active.size,
      hasMeteor: game.scene.children.includes(meteor.mesh) };
  });
  expect(result).toEqual({ meteors: 0, bullets: 0, hasMeteor: false });
});

test('production game signals readiness when embedded', async ({ page }) => {
  await page.goto('/');
  const ready = await page.evaluate(() => new Promise<boolean>((resolve) => {
    const frame = document.createElement('iframe');
    frame.src = location.href;
    const timeout = window.setTimeout(() => resolve(false), 5000);
    const listener = (event: MessageEvent) => {
      if (event.source === frame.contentWindow && event.data?.type === 'hub-app-ready') {
        window.clearTimeout(timeout);
        window.removeEventListener('message', listener);
        frame.remove();
        resolve(true);
      }
    };
    window.addEventListener('message', listener);
    document.body.append(frame);
  }));
  expect(ready).toBe(true);
});

test('unsupported WebGL produces a readable fallback instead of a blank screen', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, contextId: string, options: unknown) {
        if (contextId === 'webgl2') return null;
        return Reflect.apply(original, this, [contextId, options]);
      },
    });
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('WebGL 2');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('page lifecycle retains cached games and removes entry listeners during hot cleanup', async ({ page }) => {
  await harness(page);
  const result = await page.evaluate(() => {
    const calls: string[] = [];
    const cleanup = window.aviatorTest.attachPageLifecycle({
      start: () => calls.push('start'), stop: () => calls.push('stop'), dispose: () => calls.push('dispose'),
    });
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }));
    cleanup();
    const before = [...calls];
    window.dispatchEvent(new PageTransitionEvent('pageshow'));
    window.dispatchEvent(new PageTransitionEvent('pagehide'));
    return { before, after: calls };
  });
  expect(result.before).toEqual(['stop', 'start', 'dispose', 'dispose']);
  expect(result.after).toEqual(result.before);
});
