# Aviator

A low-poly flying game built with Three.js.

Use Node.js 20 or newer to run the build regression test.

```sh
npm install
npm run build        # Compile once and exit (CI/CD).
npm run build:watch  # Recompile when source files change; stays running.
npm run dev          # Start the webpack development server.
npm test            # Require a real build to emit bundle.js and exit successfully.
```

Build output is written to `dist/bundle.js`.

`wrangler.json` includes the empty `previews` block required by Cloudflare's
`wrangler preview` command.
