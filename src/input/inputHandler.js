import Game from "../game";

const InputHandler = {};

InputHandler.mousePos = { x: 0, y:0 };

InputHandler.handleMouseMove = event => {
    const x = -1 + (event.clientX / window.innerWidth) * 2;
    const y = 1 - (event.clientY / window.innerHeight) * 2;

    InputHandler.mousePos = { x, y };
}
  
InputHandler.handleTouchMove = event => {
    event.preventDefault();

    const x = -1 + (event.touches[0].pageX / window.innerWidth) * 2;
    const y = 1 - (event.touches[0].pageY / window.innerHeight) * 2;
    
    InputHandler.mousePos = { x, y };
}
  
InputHandler.handleMouseUp = () => {
    // if (game.status == "waitingReplay"){
    //     resetGame();
    //     hideReplay();
    // }
}
  
InputHandler.handleTouchEnd = () => {
    // if (game.status == "waitingReplay"){
    //     resetGame();
    //     hideReplay();
    // }
}

InputHandler.handleSpaceBar = () => Game.fireWeapon();

export default InputHandler;
