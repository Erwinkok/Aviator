Read /srv/AGENTS.md first.

Aviator is a standalone TypeScript/Three.js browser game; the default branch is `master`.
Use isolated worktrees and keep gameplay and the original pastel low-poly art intact unless asked otherwise.
Run `npm ci`, `npm run check` before committing. Browser checks use Chromium; set `CHROME_PATH`
or run `npx playwright install chromium`. Tests/profile harnesses belong under `test/` and never ship in `dist/`.
Document measured performance changes in `docs/performance.md`; distinguish software-rendered lab timings from real-device FPS.
Delivery for the TypeScript rewrite is a branch and pull request; deployment is outside this task.
