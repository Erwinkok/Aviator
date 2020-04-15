import * as THREE from "three";

import Scene from "./graphics/scene";
import Renderer from "./graphics/renderer";
import Camera from "./graphics/camera";
import Lighting from "./graphics/lighting";

import InputHandler from "./input/inputHandler";

import AirPlane from "./objects/vehicles/airplane";
import Sea from "./objects/landscape/sea";
import Sky from "./objects/landscape/sky";
import BasicWeapon from "./objects/weapons/basicWeapon";
import Meteor from "./objects/landscape/meteor";

const Game = {};

const bullits = [];

let scene,
    renderer,
    camera,
    width,
    height;

let clock = new THREE.Clock(),
    deltaTime,
    speed = 0,
    distance = 0,
    baseSpeed = .35,
    targetBaseSpeed = .35,
    ratioSpeedDistance = 50,
    incrementSpeedByTime = 2,
    incrementSpeedByLevel = .5,
    distanceForSpeedUpdate = 100,
    speedLastUpdate = 0;
    
Game.setup = () => {
    width = window.innerWidth;
    height = window.innerHeight;

    scene = Scene.create(width, height);
    camera = Camera.create(width, height);
    renderer = Renderer.create(width, height);
    Lighting.create(scene);

    // cameraControls = new OrbitControls(camera, renderer.domElement);
    // scene.add(cameraControls);
}

Game.createScene = () => {
    scene.add(AirPlane.create());
    scene.add(Sea.create());
    scene.add(Sky.create());
}

Game.loop = () => {
    requestAnimationFrame(Game.loop);
    // cameraControls.update(deltaTime);

    updateVariables();
    updateGame();
   
    renderer.render(scene, camera);
}

Game.resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    Camera.resize(width, height);
}

Game.addEventListeners = () => {
    document.body.onkeyup = event => event.keyCode === 32 ? InputHandler.handleSpaceBar() : null;
    document.addEventListener('mousemove', InputHandler.handleMouseMove, false);
    document.addEventListener('touchmove', InputHandler.handleTouchMove, false);
    document.addEventListener('mouseup', InputHandler.handleMouseUp, false);
    document.addEventListener('touchend', InputHandler.handleTouchEnd, false);
    window.addEventListener("resize", Game.resize, false);
}

Game.fireWeapon = () => {
    const bullit = BasicWeapon.create();
    bullits.push(bullit); 
};

Game.getScene = () => scene;

Game.getDistance = () => distance;

Game.getSpeed = () => speed;

export default Game;

const updateVariables = () => {
    if (Math.floor(distance) % distanceForSpeedUpdate == 0 && Math.floor(distance) > speedLastUpdate){
        speedLastUpdate = Math.floor(distance);
        targetBaseSpeed += incrementSpeedByTime * deltaTime;
    }

    deltaTime   = clock.getDelta();
    distance    += speed * deltaTime * ratioSpeedDistance;
    baseSpeed   += (targetBaseSpeed - baseSpeed) * deltaTime * 0.02;
    speed       = baseSpeed * AirPlane.getSpeed();

    // console.log(speed);
}

const updateGame = () => {
    Camera.update(deltaTime);
    Lighting.update(deltaTime);
    Sky.update(speed, deltaTime);
    Sea.update(speed, deltaTime);
    AirPlane.update(deltaTime, camera);
    
    while (bullits && bullits.length) {
        const bullit = bullits.shift();
        scene.add(bullit);
        BasicWeapon.add(bullit);
    } 
    
    BasicWeapon.fire(deltaTime);
    Meteor.spawn();
    Meteor.rotate(speed, deltaTime);
}