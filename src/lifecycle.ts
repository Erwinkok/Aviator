interface Lifecycle { start(): void; stop(): void; dispose(): void }

/** Remove module-owned listeners too when Vite replaces the entry module. */
export function attachPageLifecycle(game: Lifecycle): () => void {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) game.stop();
    else game.dispose();
  }, options);
  window.addEventListener('pageshow', () => game.start(), options);
  return () => {
    controller.abort();
    game.dispose();
  };
}
