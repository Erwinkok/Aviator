/** Controlled source-to-source comparison; never part of the production build. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';

const ORIGINAL = '38a9533';
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'benchmark-results');
await mkdir(output, { recursive: true });
const scratch = await mkdtemp(join(tmpdir(), 'aviator-benchmark-'));
const git = (...args: string[]) => execFileSync('git', args, { cwd: root, maxBuffer: 8 * 1024 * 1024 });
const originalFiles = git('ls-tree', '-r', '--name-only', ORIGINAL).toString().trim().split('\n');
for (const file of originalFiles.filter((file) => file.startsWith('src/') && file.endsWith('.js'))) {
  const target = join(scratch, file);
  await mkdir(dirname(target), { recursive: true });
  let source = git('show', `${ORIGINAL}:${file}`).toString();
  if (file === 'src/game.js') source += `
clock.getDelta = () => deltaTime;
export function profileTick(dt) { deltaTime = dt; updateVariables(); updateGame(); }
export function profileDraw() { renderer.render(scene, camera); }
export function profileFinish() { renderer.getContext().finish(); }
export function profileInfo() { return { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
  geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }; }
`;
  await writeFile(target, source);
}
await writeFile(join(scratch, 'three.cjs'), git('show', `${ORIGINAL}:dist/three.js`));
const seed = `let s=42;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};`;
const legacy = await build({
  stdin: {
    contents: `import Game, {profileTick, profileDraw, profileInfo, profileFinish} from './src/game.js';
      ${seed} Game.setup(); Game.createScene();
      window.profile={tick:profileTick,draw:profileDraw,fire:()=>Game.fireWeapon(),info:profileInfo,finish:profileFinish};`,
    resolveDir: scratch,
  },
  alias: { three: join(scratch, 'three.cjs') },
  bundle: true, minify: true, write: false, platform: 'browser',
});
const modern = await build({
  stdin: {
    contents: `import {Game} from './src/game.ts';
      ${seed} const game=new Game(document.querySelector('#world'));
      window.profile={tick:(dt)=>game.tick(dt),draw:()=>game.renderer.render(game.scene,game.camera.camera),
        fire:()=>game.weapon.fire(game.plane.mesh.position),finish:()=>game.renderer.getContext().finish(),
        info:()=>({calls:game.renderer.info.render.calls,triangles:game.renderer.info.render.triangles,
          geometries:game.renderer.info.memory.geometries,textures:game.renderer.info.memory.textures})};`,
    resolveDir: root,
  },
  bundle: true, minify: true, write: false, platform: 'browser',
});
const legacyCode = legacy.outputFiles[0]?.text;
const modernCode = modern.outputFiles[0]?.text;
if (!legacyCode || !modernCode) throw new Error('Missing benchmark bundle');
const styles = await readFile(join(root, 'src/style.css'), 'utf8');
const server = createServer((req, res) => {
  if (req.url === '/legacy.js' || req.url === '/modern.js') {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(req.url === '/legacy.js' ? legacyCode : modernCode);
  } else {
    const variant = req.url === '/legacy' ? 'legacy' : 'modern';
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!doctype html><html><head><style>${styles}</style></head><body><main class="game-holder"><div class="world" id="world"></div></main><script src="/${variant}.js"></script></body></html>`);
  }
});
await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Missing benchmark address');
const executablePath = process.env.CHROME_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : {}),
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
});
interface Info { calls: number; triangles: number; geometries: number; textures: number }
interface Profile { tick(delta: number): void; draw(): void; fire(): void; finish(): void; info(): Info }
declare global { interface Window { profile: Profile } }
const sourceHash = createHash('sha256');
for (const file of git('ls-files', '--cached', '--others', '--exclude-standard', 'src').toString().trim().split('\n').sort()) {
  sourceHash.update(file).update(await readFile(join(root, file)));
}
const results: Record<string, unknown> = {
  measuredSourceSha256: sourceHash.digest('hex'),
  originalCommit: ORIGINAL,
  comparedCommit: git('rev-parse', 'HEAD').toString().trim(),
  workingTreeDiffers: git('status', '--porcelain').length > 0,
  node: process.version,
  chromium: browser.version(),
  viewport: '1280x720, DPR 1',
  rendering: 'Chromium SwiftShader software WebGL; timings are lab diagnostics, not device FPS',
};
try {
  for (const variant of ['legacy', 'modern']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${address.port}/${variant}`);
    await page.waitForFunction(() => !!window.profile);
    const initial = await page.evaluate(() => {
      for (let i = 0; i < 120; i++) window.profile.tick(1 / 60);
      window.profile.draw();
      return window.profile.info();
    });
    await page.screenshot({ path: join(output, `${variant}.png`) });
    const cpu = await page.evaluate(() => {
      const samples: number[] = [];
      for (let trial = 0; trial < 7; trial++) {
        const start = performance.now();
        for (let i = 0; i < 600; i++) window.profile.tick(1 / 60);
        samples.push((performance.now() - start) / 600);
      }
      samples.sort((a, b) => a - b);
      return { medianTickMs: samples[3], samplesTickMs: samples };
    });
    const frame = await page.evaluate(() => {
      const samples: number[] = [];
      for (let i = 0; i < 45; i++) {
        const start = performance.now();
        window.profile.tick(1 / 60);
        window.profile.draw();
        window.profile.finish();
        samples.push(performance.now() - start);
      }
      samples.sort((a, b) => a - b);
      return { medianFrameMs: samples[22], p95FrameMs: samples[42],
        meaning: 'tick + render + WebGL finish; software renderer, no vsync' };
    });
    const rounds: Info[] = [];
    for (let round = 0; round < 2; round++) {
      // 60 shots, all rendered while visible, then 30 seconds to drain the scene.
      for (let burst = 0; burst < 60; burst++) {
        await page.evaluate(() => {
          window.profile.fire();
          for (let i = 0; i < 5; i++) window.profile.tick(1 / 60);
          window.profile.draw();
        });
      }
      const drained = await page.evaluate(() => {
        for (let i = 0; i < 1800; i++) window.profile.tick(1 / 60);
        window.profile.draw();
        return window.profile.info();
      });
      rounds.push(drained);
    }
    if (errors.length) throw new Error(`${variant}: ${errors.join('; ')}`);
    const code = variant === 'legacy' ? legacyCode : modernCode;
    results[variant] = { initial, cpu, frame, after60ShotsAndDrain: rounds[0], after120ShotsAndDrain: rounds[1],
      comparableEsbuildBytes: Buffer.byteLength(code), comparableEsbuildGzipBytes: gzipSync(code).length };
    console.log(variant, JSON.stringify(results[variant]));
    await page.close();
  }
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log(`Saved ${join(output, 'results.json')} and comparison screenshots.`);
  console.log(`Extracted original sources retained at ${scratch}`);
} finally {
  await browser.close();
  server.close();
}
