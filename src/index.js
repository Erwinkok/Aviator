import Game from "./game";

const init = () => {
    Game.setup();
    Game.createScene();
    Game.addEventListeners();
    Game.loop();
}

window.addEventListener("load", init, false);