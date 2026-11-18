import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function load(page: Page) {
  await page.goto('http://127.0.0.1:4174/test/harness.html');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    g.stop(); g.progress.reset(); g.score.reset(); g.meteors.reset(); g.pickups.reset(); g.weapon.reset();
    g.plane.mesh.position.set(-100, 100, 0);
  });
}

test('coin contact awards exactly 25, updates best/feedback/summary and Retry clears coins while retaining best', async ({ page }) => {
  await load(page);
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    const { x, y } = g.plane.mesh.position;
    g.pickups.add('coin', Math.atan2(y + 800, x), Math.hypot(x, y + 800));
    g.tick(0); g.tick(0);
  });
  await expect(page.locator('.score-current')).toHaveText('25');
  await expect(page.locator('.score-best')).toHaveText('25');
  await expect(page.locator('.pickup-feedback')).toHaveText('+25 · Coin');
  expect(await page.evaluate(() => window.aviatorTest.game.score.coinsCollected)).toBe(1);
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    // Shooting a pickup is not collecting it.
    g.pickups.add('coin', Math.atan2(900, 0), 900);
    g.weapon.fire(g.plane.mesh.position);
    g.weapon.update(1, g.meteors, 1000);
    g.tick(0);
    for (let i = 0; i < 3; i++) {
      g.health.update(1.5);
      const { x, y } = g.plane.mesh.position;
      g.meteors.add(Math.atan2(y + 800, x), Math.hypot(x, y + 800));
      g.tick(0);
    }
    g.tick(2);
  });
  await expect(page.getByRole('dialog', { name: 'Game over', exact: true })).toBeVisible();
  await expect(page.locator('.final-coins')).toHaveText('1');
  await expect(page.locator('.final-score')).toHaveText('Score 25');
  await page.evaluate(() => window.addEventListener('click', () => window.aviatorTest.game.stop(), { once: true }));
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  expect(await page.evaluate(() => {
    const g = window.aviatorTest.game;
    return [g.score.coinsCollected, g.score.total, g.best.total, g.pickups.active.size];
  })).toEqual([0, 0, 25, 0]);
  await expect(page.locator('.pickup-feedback')).toBeHidden();
  await page.reload();
  await expect(page.locator('.score-best')).toHaveText('25');
});

test('repair contact fills one heart, caps at three and cannot rescue a lethal collision or award coins after death', async ({ page }, info) => {
  await load(page);
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    g.health.hit();
    const { x, y } = g.plane.mesh.position;
    g.pickups.add('repair', Math.atan2(y + 800, x), Math.hypot(x, y + 800));
    g.tick(0);
    g.renderer.render(g.scene, g.camera.camera);
  });
  await expect(page.locator('.health-status')).toHaveText('3 of 3 hearts · Protected');
  await expect(page.locator('.pickup-feedback')).toHaveText('+1 heart');
  await page.screenshot({ path: info.outputPath('repair-feedback.png') });
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    const { x, y } = g.plane.mesh.position;
    g.pickups.add('repair', Math.atan2(y + 800, x), Math.hypot(x, y + 800));
    g.tick(0);
  });
  await expect(page.locator('.pickup-feedback')).toHaveText('Health full');
  expect(await page.evaluate(() => window.aviatorTest.game.score.total)).toBe(0);
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    for (let i = 0; i < 2; i++) { g.health.update(1.5); g.health.hit(); }
    g.health.update(1.5);
    const { x, y } = g.plane.mesh.position;
    const angle = Math.atan2(y + 800, x), radius = Math.hypot(x, y + 800);
    g.meteors.add(angle, radius);
    g.pickups.add('repair', angle, radius); g.pickups.add('coin', angle, radius);
    g.tick(0); g.tick(1);
  });
  await expect(page.getByRole('dialog', { name: 'Game over', exact: true })).toBeVisible();
  expect(await page.evaluate(() => {
    const g = window.aviatorTest.game;
    return [g.health.hearts, g.score.coinsCollected, g.score.total];
  })).toEqual([0, 0, 0]);
});

test('Pause and hidden-page suspension freeze pickup motion, collection and feedback, and Resume continues', async ({ page }) => {
  await load(page);
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    g.pickups.add('coin', Math.atan2(900, 100), Math.hypot(100, 900));
    g.pickups.add('coin', Math.atan2(900, -100), Math.hypot(-100, 900));
    g.tick(0);
  });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const before = await page.evaluate(() => [...window.aviatorTest.game.pickups.active].map(p => [p.angle, p.age, ...p.mesh.position.toArray()]));
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    window.aviatorTest.game.tick(5);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => [...window.aviatorTest.game.pickups.active].map(p => [p.angle, p.age, ...p.mesh.position.toArray()]))).toEqual(before);
  await expect(page.locator('.pickup-feedback')).toHaveText('+25 · Coin');
  await page.evaluate(() => window.addEventListener('click', () => window.aviatorTest.game.stop(), { once: true }));
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.evaluate(() => window.aviatorTest.game.tick(1 / 60));
  expect(await page.evaluate(() => [...window.aviatorTest.game.pickups.active][0]!.age)).toBeGreaterThan(0);
});

for (const phone of [false, true]) for (const risky of [false, true]) {
  test(`natural ${risky ? 'tighter five' : 'clear three'}-coin route works on ${phone ? 'phone' : 'desktop'} without taking damage`, async ({ browser }, info) => {
    const viewport = phone ? { width: 390, height: 844 } : { width: 1280, height: 720 };
    const context = await browser.newContext({ viewport, hasTouch: phone, isMobile: phone });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await load(page);
    const target = await page.evaluate(risky => {
      const g = window.aviatorTest.game;
      g.progress.distance = 2580; g.tick(0);
      const heights = new Map<number, number>();
      for (const p of g.pickups.active) if (p.kind === 'coin') {
        const height = Math.round(Math.sqrt(p.distance ** 2 - 100 ** 2) - 800);
        heights.set(height, (heights.get(height) ?? 0) + 1);
      }
      return [...heights].find(([, count]) => count === (risky ? 5 : 3))![0];
    }, risky);
    const point = { x: viewport.width * 0.75, y: viewport.height * (1 - (target - 100) * 0.75 / 70) / 2 };
    if (phone) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else await page.mouse.move(point.x, point.y);
    await page.evaluate(() => {
      const g = window.aviatorTest.game;
      while (g.progress.distance < 2635 && !g.health.gameOver) g.tick(1 / 60);
      g.renderer.render(g.scene, g.camera.camera);
    });
    await page.screenshot({ path: info.outputPath('coin-trails.png') });
    const result = await page.evaluate(() => {
      const g = window.aviatorTest.game;
      while (g.progress.distance < 2715 && !g.health.gameOver) g.tick(1 / 60);
      g.renderer.render(g.scene, g.camera.camera);
      return { coins: g.score.coinsCollected, score: g.score.total, distance: g.progress.distance, hearts: g.health.hearts };
    });
    expect(result.coins).toBe(risky ? 5 : 3);
    expect(result.score).toBe(Math.floor(result.distance) + result.coins * 25);
    expect(result.hearts).toBe(3);
    expect(errors).toEqual([]);
    await expect(page.locator('.pickup-feedback')).toContainText('+25');
    expect(await page.evaluate(() => [window.scrollX, window.scrollY, document.documentElement.scrollWidth])).toEqual([0, 0, viewport.width]);
    await context.close();
  });
}

test('natural occasional repair arrives between meteor groups and restores a damaged flight', async ({ page }, info) => {
  await load(page);
  const height = await page.evaluate(() => {
    const g = window.aviatorTest.game;
    g.health.hit(); g.progress.distance = 480; g.tick(0);
    const repair = [...g.pickups.active].find(p => p.kind === 'repair')!;
    return Math.round(Math.sqrt(repair.distance ** 2 - 100 ** 2) - 800);
  });
  await page.mouse.move(960, 720 * (1 - (height - 100) * 0.75 / 70) / 2);
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    while (g.progress.distance < 685 && !g.health.gameOver) g.tick(1 / 60);
    g.renderer.render(g.scene, g.camera.camera);
  });
  await page.screenshot({ path: info.outputPath('repair-approach.png') });
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    while (g.progress.distance < 725 && !g.health.gameOver) g.tick(1 / 60);
  });
  expect(await page.evaluate(() => window.aviatorTest.game.health.hearts)).toBe(3);
  await expect(page.locator('.pickup-feedback')).toHaveText('+1 heart');
});

test('repeated rendered pickup rounds reuse GPU resources and disposal leaves no pickup scene objects', async ({ page }) => {
  await load(page);
  const counts = await page.evaluate(() => {
    const g = window.aviatorTest.game, counts: number[] = [];
    for (let i = 0; i < 5; i++) {
      g.pickups.spawnTrail(0, 2);
      g.renderer.render(g.scene, g.camera.camera);
      counts.push(g.renderer.info.memory.geometries);
      g.pickups.reset();
    }
    g.dispose();
    if (g.scene.children.some(o => o.name.startsWith('pickup'))) throw new Error('Pickup objects leaked');
    return counts;
  });
  expect(new Set(counts).size).toBe(1);
  await expect(page.locator('canvas')).toHaveCount(0);
});

for (const phone of [false, true]) {
  test(`real animation loop collects a trail and shows its final summary on ${phone ? '320px phone' : 'desktop'}`, async ({ browser }, info) => {
    const viewport = phone ? { width: 320, height: 568 } : { width: 1280, height: 720 };
    const context = await browser.newContext({ viewport, hasTouch: phone, isMobile: phone });
    const page = await context.newPage();
    await load(page);
    const height = await page.evaluate(() => {
      const g = window.aviatorTest.game;
      g.progress.distance = 2580; g.tick(0);
      const counts = new Map<number, number>();
      for (const p of g.pickups.active) if (p.kind === 'coin') counts.set(p.distance, (counts.get(p.distance) ?? 0) + 1);
      const radius = [...counts].find(([, n]) => n === 3)![0];
      return Math.sqrt(radius * radius - 10000) - 800;
    });
    const point = { x: viewport.width * 0.75, y: viewport.height * (1 - (height - 100) * 0.75 / 70) / 2 };
    if (phone) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else await page.mouse.move(point.x, point.y);
    await page.evaluate(() => window.aviatorTest.game.start());
    await expect.poll(() => page.evaluate(() => window.aviatorTest.game.score.coinsCollected), { timeout: 12000 }).toBe(3);
    expect(await page.evaluate(() => window.aviatorTest.game.health.hearts)).toBe(3);
    await page.screenshot({ path: info.outputPath('live-coin-feedback.png') });
    if (phone) await page.getByRole('button', { name: 'Pause', exact: true }).tap();
    else await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.evaluate(() => {
      const g = window.aviatorTest.game;
      g.resume(); g.stop();
      for (let i = 0; i < 3; i++) {
        g.health.update(1.5);
        const { x, y } = g.plane.mesh.position;
        g.meteors.add(Math.atan2(y + 800, x), Math.hypot(x, y + 800));
        g.tick(0);
      }
      g.renderer.render(g.scene, g.camera.camera);
    });
    await expect(page.locator('.final-coins')).toHaveText('3');
    const retry = await page.getByRole('button', { name: 'Retry', exact: true }).boundingBox();
    expect(retry && retry.y >= 0 && retry.y + retry.height <= viewport.height).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.screenshot({ path: info.outputPath('coin-summary.png') });
    await context.close();
  });
}
