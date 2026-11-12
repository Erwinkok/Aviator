Read /srv/AGENTS.md first.

Aviator is a standalone TypeScript/Three.js browser game; the default branch is `master`.
Use isolated worktrees and keep gameplay and the original pastel low-poly art intact unless asked otherwise.
Use Node 22.12+; run `npm ci`, `npm run check` before committing. Browser checks use Chromium; set `CHROME_PATH`
or run `npx playwright install chromium`. Tests/profile harnesses belong under `test/` and never ship in `dist/`.
Document measured performance changes in `docs/performance.md`; distinguish software-rendered lab timings from real-device FPS.
Keep npm run build finite for CI, with continuous builds under npm run build:watch.
Preserve the Cloudflare assets.directory ./dist and previews block; test real Wrangler dry-run packaging.
Delivery is the existing Vite/TypeScript pull request; main merge and production deployment need explicit approval.
