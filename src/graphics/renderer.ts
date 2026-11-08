import { LinearSRGBColorSpace, WebGLRenderer } from 'three';

export function createRenderer(surface: HTMLElement): WebGLRenderer {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  // r115 output was linear. Preserve the original pastel art instead of applying
  // the newer renderer's default sRGB output transform a second time.
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setSize(Math.max(1, surface.clientWidth), Math.max(1, surface.clientHeight));
  renderer.shadowMap.enabled = true;
  renderer.domElement.setAttribute('aria-label', 'Aviator game view');
  surface.append(renderer.domElement);
  return renderer;
}
