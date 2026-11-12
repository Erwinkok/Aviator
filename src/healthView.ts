import { MAX_HEARTS, type Health } from './health.ts';
import type { RunPhase } from './runFlow.ts';

const scoreFormat = new Intl.NumberFormat('en-US');
interface FlowActions { play(): void; pause(): void; resume(): void; retry(): void }

/** DOM owned by one game, including its keyboard/touch accessible retry control. */
export class HealthView {
  private readonly hud = document.createElement('div');
  private readonly dialog = document.createElement('dialog');
  private readonly status = document.createElement('p');
  private readonly scoreHud = document.createElement('dl');
  private readonly currentScore = document.createElement('dd');
  private readonly bestScore = document.createElement('dd');
  private readonly bestLabel = document.createElement('dt');
  private readonly finalScore = document.createElement('p');
  private readonly finalBest = document.createElement('p');
  private readonly summary = document.createElement('dl');
  private readonly finalDistance = document.createElement('dd');
  private readonly finalMeteors = document.createElement('dd');
  private readonly heading = document.createElement('h1');
  private readonly message = document.createElement('p');
  private readonly controls = document.createElement('p');
  private readonly actionButton = document.createElement('button');
  private readonly pauseButton = document.createElement('button');
  private readonly hearts: HTMLElement[] = [];
  private readonly controller = new AbortController();
  private previous = '';
  private previousScore = '';
  private phase: RunPhase = 'ready';

  constructor(surface: HTMLElement, actions: FlowActions) {
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

    this.scoreHud.className = 'score-hud';
    // Scores remain available to assistive tech without announcing every point.
    this.scoreHud.setAttribute('aria-live', 'off');
    const scoreLabel = document.createElement('dt');
    scoreLabel.className = this.bestLabel.className = 'score-label';
    scoreLabel.textContent = 'Score';
    this.currentScore.className = 'score-current';
    this.bestScore.className = 'score-best';
    this.scoreHud.append(scoreLabel, this.currentScore, this.bestLabel, this.bestScore);

    this.dialog.className = 'game-over';
    this.finalScore.className = 'final-score';
    this.finalBest.className = 'final-best';
    this.summary.className = 'run-summary';
    this.finalDistance.className = 'final-distance';
    this.finalMeteors.className = 'final-meteors';
    for (const [title, value] of [['Distance', this.finalDistance], ['Meteors destroyed', this.finalMeteors]] as const) {
      const row = document.createElement('div');
      const label = document.createElement('dt');
      label.textContent = title;
      row.append(label, value);
      this.summary.append(row);
    }
    this.controls.className = 'flight-controls';
    this.controls.innerHTML = 'Move your mouse or drag to steer.<br>Release <strong>Space</strong> on a keyboard to fire.<br>Use <strong>Pause</strong> or <strong>Esc</strong> to take a break.';
    this.actionButton.type = 'button';
    this.actionButton.autofocus = true;
    this.actionButton.addEventListener('click', () => {
      if (this.phase === 'ready') actions.play();
      else if (this.phase === 'paused') actions.resume();
      else if (this.phase === 'over') actions.retry();
    }, { signal: this.controller.signal });
    this.pauseButton.className = 'pause-button';
    this.pauseButton.type = 'button';
    this.pauseButton.textContent = 'Pause';
    this.pauseButton.addEventListener('click', () => actions.pause(), { signal: this.controller.signal });
    // Escape is handled by Game; never let native dialog cancellation bypass it.
    this.dialog.addEventListener('cancel', (event) => event.preventDefault(), { signal: this.controller.signal });
    this.dialog.append(this.heading, this.finalScore, this.finalBest, this.summary, this.message, this.controls, this.actionButton);
    surface.append(this.hud, this.scoreHud, this.pauseButton, this.dialog);
  }

  updateScore(score: number, best: number, persistent: boolean, distance: number, meteors: number): void {
    const state = `${score}:${best}:${persistent}:${distance}:${meteors}`;
    if (state === this.previousScore) return;
    this.previousScore = state;
    this.currentScore.textContent = scoreFormat.format(score);
    this.bestScore.textContent = scoreFormat.format(best);
    this.bestLabel.textContent = persistent ? 'Best' : 'Best this visit';
    this.finalScore.textContent = `Score ${scoreFormat.format(score)}`;
    this.finalBest.textContent = `${persistent ? 'Personal best' : 'Best this visit'} ${scoreFormat.format(best)}`;
    this.finalDistance.textContent = scoreFormat.format(distance);
    this.finalMeteors.textContent = scoreFormat.format(meteors);
  }

  update(health: Health, phase: RunPhase): void {
    const state = `${health.hearts}:${health.protected}:${phase}`;
    if (state === this.previous) return;
    this.previous = state;
    this.hearts.forEach((heart, i) => heart.classList.toggle('is-empty', i >= health.hearts));
    this.hud.classList.toggle('is-protected', health.protected);
    this.status.textContent = `${health.hearts} of ${MAX_HEARTS} hearts${health.protected ? ' · Protected' : ''}`;
    this.phase = phase;
    this.pauseButton.hidden = phase !== 'playing';
    this.controls.hidden = phase !== 'ready';
    this.finalScore.hidden = this.finalBest.hidden = this.summary.hidden = phase !== 'over';
    const title = phase === 'ready' ? 'Aviator' : phase === 'paused' ? 'Paused' : 'Game over';
    this.heading.textContent = title;
    this.dialog.setAttribute('aria-label', title);
    this.message.textContent = phase === 'ready' ? 'Fly, dodge, and beat your best.' : phase === 'paused' ? 'Your flight is on hold.' : 'Ready for another flight?';
    this.actionButton.textContent = phase === 'ready' ? 'Play' : phase === 'paused' ? 'Resume' : 'Retry';
    if (phase !== 'playing' && !this.dialog.open) this.dialog.showModal();
    else if (phase === 'playing' && this.dialog.open) this.dialog.close();
  }

  dispose(): void {
    this.controller.abort();
    this.dialog.close();
    this.dialog.remove();
    this.hud.remove();
    this.scoreHud.remove();
    this.pauseButton.remove();
  }
}
