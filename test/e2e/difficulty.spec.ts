import { test, expect } from '@playwright/test';

test('difficulty pauses with the run and Retry restores the quiet opening', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174/test/harness.html');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  const opening = await page.evaluate(() => {
    const g = window.aviatorTest.game;
    g.stop(); g.progress.reset(); g.meteors.reset();
    g.plane.mesh.position.set(-100, 100, 0);
    for (let i = 0; i < 240; i++) g.tick(1 / 60);
    return { distance: g.progress.distance, speed: g.progress.speed, meteors: g.meteors.active.size, hearts: g.health.hearts };
  });
  expect(opening.distance).toBeGreaterThan(70);
  // Four seconds include the first spawn, but its approach still gives time to learn controls.
  expect(opening.meteors).toBe(1);
  expect(opening.hearts).toBe(3);
  expect(opening.speed).toBeLessThan(0.4);
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    g.progress.distance = 2580;
    g.meteors.reset(); g.tick(0);
  });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const before = await page.evaluate(() => {
    const g = window.aviatorTest.game;
    return [g.progress.distance, g.progress.speed, ...[...g.meteors.active].map((m) => m.angle)];
  });
  await page.evaluate(() => { for (let i = 0; i < 600; i++) window.aviatorTest.game.tick(1 / 60); });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => {
    const g = window.aviatorTest.game;
    return [g.progress.distance, g.progress.speed, ...[...g.meteors.active].map((m) => m.angle)];
  })).toEqual(before);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.evaluate(() => {
    const g = window.aviatorTest.game;
    g.stop(); g.meteors.reset();
    for (let i = 0; i < 3; i++) {
      g.health.update(1.5);
      const { x, y } = g.plane.mesh.position;
      g.meteors.add(Math.atan2(y + 800, x), Math.hypot(x, y + 800));
      g.tick(0);
    }
    window.addEventListener('click', () => g.stop(), { once: true });
  });
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  expect(await page.evaluate(() => {
    const g = window.aviatorTest.game;
    g.tick(1 / 60);
    return [g.progress.distance, g.progress.speed, g.meteors.active.size, g.health.hearts];
  })).toEqual([0, 0.28 * 1.2, 0, 3]);
});

for (const phone of [false, true]) {
  test(`maximum difficulty has a usable route and recovery gap on ${phone ? 'phone' : 'desktop'}`, async ({ browser }, info) => {
    const context = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1280, height: 720 }, hasTouch: phone, isMobile: phone });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://127.0.0.1:4174/test/harness.html');
    if (phone) await page.getByRole('button', { name: 'Play', exact: true }).tap();
    else await page.getByRole('button', { name: 'Play', exact: true }).click();
    const approach = await page.evaluate(() => {
      const g = window.aviatorTest.game;
      g.stop(); g.progress.distance = 2580; g.meteors.reset();
      g.input.position.x = 0.5;
      g.plane.mesh.position.set(-100, 100, 0);
      const blocked = new Set<number>();
      let maxRow = 0;
      let previous = 0;
      while (g.progress.distance < 2655 && !g.health.gameOver) {
        for (const m of g.meteors.active) blocked.add(Math.round(Math.sqrt(m.distance ** 2 - 100 ** 2) - 800));
        if (blocked.size === 2) {
          const safe = [50, 100, 150].find((height) => !blocked.has(height))!;
          g.input.position.y = (safe - 100) * 0.75 / 70;
        }
        g.tick(1 / 60);
        maxRow = Math.max(maxRow, g.meteors.active.size - previous);
        previous = g.meteors.active.size;
      }
      g.renderer.render(g.scene, g.camera.camera);
      return { hearts: g.health.hearts, speed: g.progress.speed, maxRow, blocked: [...blocked] };
    });
    expect(approach.hearts).toBe(3);
    expect(approach.speed).toBeCloseTo(0.42 * 1.6);
    expect(approach.maxRow).toBe(2);
    expect(approach.blocked).toHaveLength(2);
    await page.screenshot({ path: info.outputPath(`difficulty-${phone ? 'phone' : 'desktop'}.png`) });
    const recovery = await page.evaluate(() => {
      const g = window.aviatorTest.game;
      let spawns = 0;
      const add = g.meteors.add.bind(g.meteors);
      // Count add calls as pooled objects may be reused during a regression.
      g.meteors.add = (angle, radius) => {
        if (g.progress.distance >= 2701) spawns++;
        return add(angle, radius);
      };
      while (g.progress.distance < 2780 && !g.health.gameOver) {
        g.tick(1 / 60);
      }
      g.meteors.add = add;
      g.renderer.render(g.scene, g.camera.camera);
      return { hearts: g.health.hearts, spawns, score: g.score.total, distance: g.progress.distance };
    });
    expect(recovery.hearts).toBe(3);
    expect(recovery.spawns).toBe(0);
    expect(recovery.distance).toBeGreaterThanOrEqual(2780);
    expect(recovery.score).toBe(Math.floor(recovery.distance));
    expect(errors).toEqual([]);
    await page.screenshot({ path: info.outputPath(`recovery-${phone ? 'phone' : 'desktop'}.png`) });
    await context.close();
  });
}
