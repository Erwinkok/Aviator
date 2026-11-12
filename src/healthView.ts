import { MAX_HEARTS, type Health } from './health.ts';

/** DOM owned by one game, including its keyboard/touch accessible retry control. */
export class HealthView {
  private readonly hud = document.createElement('div');
  private readonly dialog = document.createElement('dialog');
  private readonly status = document.createElement('p');
  private readonly hearts: HTMLElement[] = [];
  private readonly controller = new AbortController();
  private previous = '';

  constructor(surface: HTMLElement, retry: () => void) {
    this.hud.className = 'health-hud';
    const label = document.createElement('span');
    label.className = 'health-label';
    label.textContent = 'Health';
    const row = document.createElement('div');
    row.className = 'hearts';
    row.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < MAX_HEARTS; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart';
      heart.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 3.4 12.5C-2 7 5.5-1 12 5.2 18.5-1 26 7 20.6 12.5Z"/></svg>';
      this.hearts.push(heart);
      row.append(heart);
    }
    this.status.className = 'health-status';
    this.status.setAttribute('role', 'status');
    this.status.setAttribute('aria-atomic', 'true');
    this.hud.append(label, row, this.status);

    this.dialog.className = 'game-over';
    this.dialog.setAttribute('aria-label', 'Game over');
    const heading = document.createElement('h1');
    heading.textContent = 'Game over';
    const message = document.createElement('p');
    message.textContent = 'Ready for another flight?';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Retry';
    button.autofocus = true;
    button.addEventListener('click', retry, { signal: this.controller.signal });
    // Keep the retry choice available until a new run starts.
    this.dialog.addEventListener('cancel', (event) => event.preventDefault(), { signal: this.controller.signal });
    this.dialog.append(heading, message, button);
    surface.append(this.hud, this.dialog);
  }

  update(health: Health): void {
    const state = `${health.hearts}:${health.protected}`;
    if (state === this.previous) return;
    this.previous = state;
    this.hearts.forEach((heart, i) => heart.classList.toggle('is-empty', i >= health.hearts));
    this.hud.classList.toggle('is-protected', health.protected);
    this.status.textContent = `${health.hearts} of ${MAX_HEARTS} hearts${health.protected ? ' · Protected' : ''}`;
    if (health.gameOver && !this.dialog.open) this.dialog.showModal();
    else if (!health.gameOver && this.dialog.open) this.dialog.close();
  }

  dispose(): void {
    this.controller.abort();
    this.dialog.close();
    this.dialog.remove();
    this.hud.remove();
  }
}
