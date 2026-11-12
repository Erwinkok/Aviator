import { normalize } from '../utils/utils.ts';

export interface PointerPosition { x: number; y: number }

export class InputHandler {
  readonly position: PointerPosition = { x: 0, y: 0 };
  private readonly controller = new AbortController();

  constructor(private readonly surface: HTMLElement, fire: () => void) {
    const options = { signal: this.controller.signal };
    surface.addEventListener('pointermove', (event) => {
      if (!this.isControl(event.target)) this.move(event.clientX, event.clientY);
    }, options);
    // Touch movement must not scroll the page. Pointer events also cover pen/mouse.
    surface.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch' && !this.isControl(event.target)) {
        surface.setPointerCapture(event.pointerId);
        this.move(event.clientX, event.clientY);
      }
    }, options);
    window.addEventListener('keyup', (event) => {
      const target = event.target;
      const editing = target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName));
      if (event.code === 'Space' && !editing) {
        event.preventDefault();
        fire();
      }
    }, options);
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space' && (event.target === document.body || event.target === surface)) event.preventDefault();
    }, options);
  }

  move(clientX: number, clientY: number): void {
    const rect = this.surface.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    this.position.x = normalize(clientX - rect.left, 0, rect.width, -1, 1);
    this.position.y = normalize(clientY - rect.top, 0, rect.height, 1, -1);
  }

  dispose(): void { this.controller.abort(); }

  private isControl(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest('button, dialog') !== null;
  }
}
