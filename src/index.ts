import './style.css';
import { Game } from './game.ts';
import { attachPageLifecycle } from './lifecycle.ts';

const surface = document.querySelector<HTMLElement>('#world');
const error = document.querySelector<HTMLElement>('#error');
let game: Game | undefined;
let cleanup = (): void => {};

try {
  if (!surface) throw new Error('Missing game surface');
  game = new Game(surface);
  game.start();
  cleanup = attachPageLifecycle(game);
  if (window.parent !== window) window.parent.postMessage({ type: 'hub-app-ready' }, '*');
} catch (cause) {
  game?.dispose();
  console.error('Unable to start Aviator', cause);
  if (error) {
    error.textContent = 'Aviator needs a browser with WebGL 2 enabled. Please enable hardware acceleration or try another browser.';
    error.hidden = false;
  }
}

// Keep resource/event ownership clear during Vite hot updates and navigation.
if (import.meta.hot) import.meta.hot.dispose(() => cleanup());
