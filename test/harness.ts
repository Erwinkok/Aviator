import '../src/style.css';
import { Game } from '../src/game.ts';
import { attachPageLifecycle } from '../src/lifecycle.ts';
import { seededRandom } from '../src/utils/utils.ts';

declare global { interface Window { aviatorTest: { game: Game; create: () => Game; attachPageLifecycle: typeof attachPageLifecycle; restoreContext?: () => void } } }
const surface = document.querySelector<HTMLElement>('#world');
if (!surface) throw new Error('Missing test surface');
const create = () => new Game(surface, seededRandom(42));
const game = create();
window.aviatorTest = { game, create, attachPageLifecycle };
game.start();
