# Aviator

Erwin Kok's pastel, low-poly flying game. Steer with the mouse or drag on a
touchscreen; release **Space** to fire. The plane, rolling sea, clouds, meteors,
collisions and speed progression preserve the original game. Start each run with
three hearts. A meteor hit costs one heart and grants 1.5 seconds of protection
during active play; further contacts during protection cause no damage or knockback.
At zero hearts the flight stops. Choose **Retry** (touch, mouse or keyboard) to
start a fresh run without reloading the page. Health is shown at the top left;
filled and outlined hearts distinguish remaining health without relying on colour.

Rewritten in strict TypeScript with Vite and Three.js r187. There is no server,
account, scoring system or external service. WebGL 2 is required.

## Development

Use Node **22.12+** (required by Vite and the pinned Wrangler tool).

```sh
npm ci
npm run dev
```

Open the loopback address Vite prints. `npm run build` checks types and generates
`dist/`; `npm run preview` serves that build locally. Asset paths are relative,
so the generated site also works under a subdirectory. Generated bundles are no
longer tracked in git. npm run build:watch enables continuous production rebuilds;
npm run build:prod remains an alias for the finite production build.

## Verification

```sh
npx playwright install chromium # or set CHROME_PATH to installed Chromium
npm run check
```

The check runs strict type checking, a production build, unit/regression tests,
real Vite build/Cloudflare packaging regressions, and WebGL browser checks. Playwright starts/stops local preview and test
servers on ports 4173/4174. Test-only controls live under `test/` and are absent
from the production bundle. Browser checks cover mouse/Space, touch, resizing,
visibility, WebGL context restoration, and repeated teardown/recreation.

A GitHub Actions example is provided at [docs/ci-workflow.example.yml](docs/ci-workflow.example.yml).
It is a template rather than an active workflow: the repository credential used
for this delivery cannot upload workflow files. Local checks above are complete;
automated GitHub checks can be enabled later with an appropriately scoped credential.

## Structure

- `src/game.ts`: owns the scene, fixed-step loop, input and resource lifecycle.
- `src/simulation.ts`: deterministic cadence and flight progress, independent of WebGL.
- `src/health.ts`, `src/healthView.ts`: run health, hit protection and accessible health/retry UI.
- `src/objects/`: aircraft, sea/clouds, meteors and projectiles.
- `src/graphics/`: camera, original-palette lighting and renderer.
- `test/`: logic tests and browser-only harness.

The TypeScript work is delivered as a branch and pull request for review.

## Improvements and measurements

See [the review and performance report](docs/performance.md) for before/after
measurements, implemented fixes, visual comparisons, tradeoffs and remaining
recommendations. Reproduce the source-to-source comparison with:

```sh
npm run benchmark
```

It reads original commit `38a9533` from local git history and writes JSON and
screenshots under ignored `benchmark-results/`. Fetch full history first if you
have a shallow clone. Benchmark/test servers bind to loopback only.

A multi-stage Dockerfile and `docker-compose.yml` are provided for a later
private deployment. The runtime joins the external `web` network, publishes no
ports, and permits framing by the Hub. Connecting a hostname/login and deploying
are separate from this pull request.

## Cloudflare static hosting

The existing Wrangler configuration serves the freshly generated dist/ directory
as the aviator Worker, retaining its compatibility date and empty previews block.
The generated HTML references Vite's hashed module/CSS assets; no manually maintained
bundle.js or checked-in build is needed.

After npm run build, use npm run deploy:check to validate packaging without
publishing. npm test also exercises real Wrangler dry-run packaging and Preview
validation against a rejecting local API, with no upload or deployment.
