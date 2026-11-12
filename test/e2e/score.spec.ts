import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const BEST_KEY = 'aviator.best-score.v1';

async function load(page: Page) {
  await page.goto('http://127.0.0.1:4174/test/harness.html');
  await page.waitForFunction(() => window.aviatorTest?.game.renderer.info.render.calls > 0);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.stop();
    game.progress.reset(); game.score.reset(); game.meteors.reset(); game.weapon.reset();
    game.plane.mesh.position.set(-100, 100, 0);
    game.tick(0);
  });
}

async function endRun(page: Page) {
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    for (let hit = 0; hit < 3; hit++) {
      game.health.update(1.5);
      const { x, y } = game.plane.mesh.position;
      game.meteors.add(Math.atan2(y + 800, x), Math.hypot(x, y + 800));
      game.tick(0);
    }
    game.renderer.render(game.scene, game.camera.camera);
  });
  await expect(page.getByRole('dialog', { name: 'Game over' })).toBeVisible();
}

test('production flight displays growing points and retains the best after reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect.poll(async () => Number(await page.locator('.score-current').textContent())).toBeGreaterThan(2);
  const score = Number(await page.locator('.score-current').textContent());
  await page.reload();
  await expect.poll(async () => Number((await page.locator('.score-best').textContent())?.replaceAll(',', ''))).toBeGreaterThanOrEqual(score);
  expect(await page.evaluate(() => 'aviatorTest' in window)).toBe(false);
  expect(errors).toEqual([]);
});

test('real projectile kills award 100 once, added to whole distance points', async ({ page }, info) => {
  await load(page);
  const result = await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.progress.distance = 123.9;
    const p = game.plane.mesh.position;
    const angle = Math.atan2(p.y + 800, p.x + 15);
    const meteor = game.meteors.add(angle, Math.hypot(p.x + 15, p.y + 800));
    // Overlap with two shots, outside the plane's collision radius.
    game.weapon.fire(p); game.weapon.fire(p);
    game.tick(0);
    const score = game.score.total;
    game.tick(0);
    game.renderer.render(game.scene, game.camera.camera);
    return { score, after: game.score.total, removed: !game.meteors.active.has(meteor) };
  });
  expect(result).toEqual({ score: 223, after: 223, removed: true });
  await expect(page.locator('.score-current')).toHaveText('223');
  await expect(page.locator('.score-best')).toHaveText('223');
  await page.screenshot({ path: info.outputPath('score-desktop.png') });
});

test('collisions, offscreen meteors and missed shots earn no kill bonus', async ({ page }) => {
  await load(page);
  const result = await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.progress.distance = 20.8;
    const { x, y } = game.plane.mesh.position;
    game.meteors.add(Math.atan2(y + 800, x), Math.hypot(x, y + 800));
    game.meteors.add(Math.PI + 0.1, 900);
    game.weapon.fire(game.plane.mesh.position);
    game.tick(0);
    for (let i = 0; i < 120; i++) game.tick(1 / 60);
    return { score: game.score.total, expected: Math.floor(game.progress.distance), hearts: game.health.hearts };
  });
  expect(result.hearts).toBe(2);
  expect(result.score).toBe(result.expected);
});

test('final score freezes, a lethal collision prevents later shot credit, and Retry keeps the best', async ({ page }, info) => {
  await load(page);
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.progress.distance = 345.8;
    game.tick(0);
  });
  await endRun(page);
  await expect(page.locator('.final-score')).toHaveText('Score 345');
  await expect(page.locator('.final-best')).toHaveText('Personal best 345');
  expect(await page.evaluate((key) => localStorage.getItem(key), BEST_KEY)).toBe('345');
  await page.screenshot({ path: info.outputPath('final-score-desktop.png') });
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.progress.distance = 900;
    game.tick(1);
    game.score.update(900, 5);
  });
  await expect(page.locator('.final-score')).toHaveText('Score 345');
  expect(await page.evaluate(() => window.aviatorTest.game.score.total)).toBe(345);
  await page.getByRole('button', { name: 'Retry' }).click();
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.stop();
    game.progress.distance = 10;
    game.tick(0);
    // Finish health first so a real collision in the next tick is lethal.
    game.health.hit(); game.health.update(1.5);
    game.health.hit(); game.health.update(1.5);
    const { x, y } = game.plane.mesh.position;
    game.meteors.add(Math.atan2(y + 800, x), Math.hypot(x, y + 800));
    game.meteors.add(Math.atan2(y + 800, x + 15), Math.hypot(x + 15, y + 800));
    game.weapon.fire(game.plane.mesh.position);
    game.tick(0);
  });
  await expect(page.locator('.final-score')).toHaveText('Score 10');
  await expect(page.locator('.score-best')).toHaveText('345');
  expect(await page.evaluate((key) => localStorage.getItem(key), BEST_KEY)).toBe('345');
});

test('hidden-page time adds no points and suspension saves the current best', async ({ page }) => {
  await load(page);
  const before = await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.progress.distance = 50.7;
    game.tick(0);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    game.start();
    document.dispatchEvent(new Event('visibilitychange'));
    return game.score.total;
  });
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.aviatorTest.game.score.total)).toBe(before);
  expect(await page.evaluate((key) => localStorage.getItem(key), BEST_KEY)).toBe('50');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => page.evaluate(() => window.aviatorTest.game.score.total)).toBeGreaterThan(before);
});

for (const mode of ['malformed', 'blocked', 'quota'] as const) {
  test(`game remains playable with ${mode} score storage`, async ({ page }) => {
    await page.addInitScript(({ mode, key }) => {
      if (mode === 'malformed') localStorage.setItem(key, '{broken');
      if (mode === 'blocked') Object.defineProperty(window, 'localStorage', { get: () => { throw new DOMException('Blocked', 'SecurityError'); } });
      if (mode === 'quota') Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
    }, { mode, key: BEST_KEY });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await load(page);
    await page.evaluate(() => {
      const game = window.aviatorTest.game;
      game.progress.distance = 250;
      game.tick(0);
    });
    await endRun(page);
    await expect(page.locator('.final-score')).toHaveText('Score 250');
    await expect(page.locator('.final-best')).toHaveText(`${mode === 'malformed' ? 'Personal best' : 'Best this visit'} 250`);
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.locator('.score-best')).toHaveText('250');
    expect(errors).toEqual([]);
  });
}

test('phone score is readable and touch Retry preserves the record', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await load(page);
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.progress.distance = 1234;
    game.tick(0);
    game.renderer.render(game.scene, game.camera.camera);
  });
  await page.screenshot({ path: info.outputPath('score-phone.png') });
  await endRun(page);
  await expect(page.locator('.final-score')).toHaveText('Score 1,234');
  await expect(page.locator('.final-best')).toHaveText('Personal best 1,234');
  await page.screenshot({ path: info.outputPath('final-score-phone.png') });
  await page.getByRole('button', { name: 'Retry' }).tap();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('.score-best')).toHaveText('1,234');
  await page.evaluate(() => window.aviatorTest.game.dispose());
  await expect(page.locator('.score-hud')).toHaveCount(0);
  await context.close();
});

test('large scores stay inside narrow phone layouts beside health protection feedback', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '9007199254740991'), BEST_KEY);
  await load(page);
  await page.evaluate(() => {
    const game = window.aviatorTest.game;
    game.progress.distance = Number.MAX_SAFE_INTEGER;
    const { x, y } = game.plane.mesh.position;
    game.meteors.add(Math.atan2(y + 800, x), Math.hypot(x, y + 800));
    game.tick(0);
  });
  await expect(page.getByRole('status')).toHaveText('2 of 3 hearts · Protected');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 568 });
    const health = await page.locator('.health-hud').boundingBox();
    const score = await page.locator('.score-hud').boundingBox();
    expect(health && score && health.x + health.width < score.x).toBeTruthy();
    expect(score && score.x + score.width <= width).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  await endRun(page);
  await expect(page.locator('.final-score')).toHaveText('Score 9,007,199,254,740,991');
  const box = await page.getByRole('button', { name: 'Retry' }).boundingBox();
  expect(box && box.y >= 0 && box.y + box.height <= 568).toBeTruthy();
});
