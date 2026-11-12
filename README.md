# Aviator

A low-poly flying game built with Three.js.

Use Node.js 22 or newer for Wrangler and the regression tests.

```sh
npm install
npm run build        # Compile once and exit (CI/CD).
npm run build:watch  # Recompile when source files change; stays running.
npm run dev          # Start the webpack development server.
npm test            # Check build completion and actual Wrangler asset packaging.
npm run deploy:check # Validate Wrangler packaging without publishing.
```

Build output is written to `dist/bundle.js`.

`wrangler.json` configures the existing `aviator` Worker to serve static files
from `dist/`, including its checked-in HTML page and the freshly built bundle.
It retains the empty `previews` block required by `wrangler preview`.
