import * as THREE from "three";
import Utils from "../../utils/utils";
import Colors from "../../utils/colors";
import InputHandler from "../../input/inputHandler";

const AirPlane = {};

let airplane = null;

let planeDefaultHeight = 100,
    planeAmpHeight = 70,
    planeAmpWidth = 75,
    planeMoveSensivity = 3.5,
    planeRotXSensivity = 0.8,
    planeRotZSensivity = 0.4,
    planeMinSpeed = 1.2,
    planeMaxSpeed = 1.6,
    planeSpeed = 0,
    planeCollisionDisplacementX = 0,
    planeCollisionSpeedX = 0,
    planeCollisionDisplacementY = 0,
    planeCollisionSpeedY = 0;

AirPlane.create = () => {
    airplane = new THREE.Object3D();
    airplane.name = "AirPlane";

    const cabin = createCabin();
    airplane.add(cabin);
    
    const engine = createEngine();
    airplane.add(engine);

    const tale = createTale();
    airplane.add(tale);

    const wings = createWings();
    airplane.add(wings);

    const windshield = createWindShield();
    airplane.add(windshield);

    const propellor = createPropellor();
    airplane.add(propellor);

    const tires = createTires();
    airplane.add(tires);

    airplane.scale.set(.25,.25,.25);
    airplane.position.y = planeDefaultHeight;
    airplane.position.x = -(window.innerWidth);

    return airplane;
}

AirPlane.update = deltaTime => {
    planeSpeed = Utils.normalize(InputHandler.mousePos.x, -.5, .5, planeMinSpeed, planeMaxSpeed);
    
    let targetY = Utils.normalize(InputHandler.mousePos.y, -.75, .75, planeDefaultHeight - planeAmpHeight, planeDefaultHeight + planeAmpHeight);
    let targetX = Utils.normalize(InputHandler.mousePos.x, -.75, .75, -planeAmpWidth * .7, -planeAmpWidth * 2);

    planeCollisionDisplacementX += planeCollisionSpeedX;
    targetX += planeCollisionDisplacementX;

    planeCollisionDisplacementY += planeCollisionSpeedY;
    targetY += planeCollisionDisplacementY;

    airplane.position.y += (targetY - airplane.position.y) * deltaTime * planeMoveSensivity;
    airplane.position.x += (targetX - airplane.position.x) * deltaTime * planeMoveSensivity;

    airplane.rotation.z = (targetY - airplane.position.y) * deltaTime * planeRotXSensivity;
    airplane.rotation.x = (airplane.position.y - targetY) * deltaTime * planeRotZSensivity;

    planeCollisionSpeedX += (0 - planeCollisionSpeedX) * deltaTime * planeMoveSensivity;
    planeCollisionDisplacementX += (0 - planeCollisionDisplacementX) * deltaTime * planeMoveSensivity;
    planeCollisionSpeedY += ( 0 - planeCollisionSpeedY) * deltaTime * planeMoveSensivity;
    planeCollisionDisplacementY += (0 - planeCollisionDisplacementY) * deltaTime * planeMoveSensivity;

    // Rotating the propellor.
    airplane.children.some(child => {
        if (child.name === "propellor") {
            child.rotation.x += .2 + planeSpeed * deltaTime * .005;
        }
    });
}

AirPlane.setPositionDisplacement = (collisionSpeedX, collisionSpeedY) => {
    console.log(collisionSpeedX, collisionSpeedY);
    planeCollisionSpeedX = collisionSpeedX;
    planeCollisionSpeedY = collisionSpeedY;
}

AirPlane.reset = () => {
    planeDefaultHeight = 100,
    planeAmpHeight = 80,
    planeAmpWidth = 105,
    planeMoveSensivity = 2,
    planeRotXSensivity = 0.6,
    planeRotZSensivity = 0.4,
    planeMinSpeed = 1.2,
    planeMaxSpeed = 1.6,
    planeSpeed = 0,
    planeCollisionDisplacementX = 0,
    planeCollisionSpeedX = 0,
    planeCollisionDisplacementY = 0,
    planeCollisionSpeedY = 0;
}

AirPlane.getPosition = () => airplane.position;

AirPlane.getSpeed = () => planeSpeed;

AirPlane.getDefaultHeight = () => planeDefaultHeight;

AirPlane.getAmpHeight = () => planeAmpHeight;

export default AirPlane;

const createCabin = () => {
    const cabinGeometry = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);
    const cabinMaterial = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });

    cabinGeometry.vertices[4].y-=10;
    cabinGeometry.vertices[4].z+=20;
    cabinGeometry.vertices[5].y-=10;
    cabinGeometry.vertices[5].z-=20;
    cabinGeometry.vertices[6].y+=30;
    cabinGeometry.vertices[6].z+=20;
    cabinGeometry.vertices[7].y+=30;
    cabinGeometry.vertices[7].z-=20;  

    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.castShadow = true;
    cabin.receiveShadow = true;

    cabin.name = "cabin";

    return cabin;
}

const createEngine = () => {
    const engineGeometry = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: Colors.white, flatShading: true });

    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.x = 40;
    engine.castShadow = true;
    engine.receiveShadow = true;
    engine.name = "engine";

    return engine;
}

const createTale = () => {
    const taleGeometry = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    const taleMaterial = new THREE.MeshPhongMaterial({ color: Colors.black });

    const tale = new THREE.Mesh(taleGeometry, taleMaterial);
    tale.position.set(-40, 20, 0);
    tale.castShadow = true;
    tale.receiveShadow = true;
    tale.name = "tale";

    return tale;
}

const createWings = () => {
    const wingsGeometry = new THREE.BoxGeometry(30, 10, 120, 1, 1, 1);
    const wingsMaterial = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });

    const wings = new THREE.Mesh(wingsGeometry, wingsMaterial);
    wings.position.set(0, 15, 0);
    wings.castShadow = true;
    wings.receiveShadow = true;
    wings.name = "wings";

    return wings;
}

const createWindShield = () => {
  const windShieldGeometry = new THREE.BoxGeometry(3, 15, 20, 1, 1, 1);
  const windShieldMaterial = new THREE.MeshPhongMaterial({ color: Colors.white, transparent: true, opacity: .3, flatShading: true });
  
  const windshield = new THREE.Mesh(windShieldGeometry, windShieldMaterial);
  windshield.position.set(5,27,0);
  windshield.castShadow = true;
  windshield.receiveShadow = true;

  return windshield;
}

const createPropellor = () => {
    const propGeometry = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    const propMaterial = new THREE.MeshPhongMaterial({ color: Colors.black, flatShading: true });

    propGeometry.vertices[4].y-=5;
    propGeometry.vertices[4].z+=5;
    propGeometry.vertices[5].y-=5;
    propGeometry.vertices[5].z-=5;
    propGeometry.vertices[6].y+=5;
    propGeometry.vertices[6].z+=5;
    propGeometry.vertices[7].y+=5;
    propGeometry.vertices[7].z-=5;

    const propellor = new THREE.Mesh(propGeometry, propMaterial);
    propellor.position.set(60, 0, 0);
    propellor.castShadow = true;
    propellor.receiveShadow = true;
    propellor.name = "propellor";

    const blade1 = createBlade();
    blade1.position.set(8, 0, 0);
    blade1.name = "blade1";

    const blade2 = blade1.clone();
    blade2.rotation.x = Math.PI/2;
    blade2.name = "blade2";

    propellor.add(blade1);
    propellor.add(blade2);

    return propellor;
}

const createBlade = () => {
    const bladeGeometry = new THREE.BoxGeometry(1, 80, 10, 1, 1, 1);   
    const bladeMaterial = new THREE.MeshPhongMaterial({ color: Colors.lightBlack, flatShading: true });

    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.castShadow = true;
    blade.receiveShadow = true;

    return blade;
}

const createTires = () => {
    const tires = new THREE.Object3D();
    var wheelProtecGeom = new THREE.BoxGeometry(30, 15, 10, 1, 1, 1);
    var wheelProtecMat = new THREE.MeshPhongMaterial({ color:Colors.red, flatShading: true });
    var wheelProtecR = new THREE.Mesh(wheelProtecGeom,wheelProtecMat);
    wheelProtecR.position.set(25,-20,25);
    tires.add(wheelProtecR);

    var wheelTireGeom = new THREE.BoxGeometry(24, 24, 4);
    var wheelTireMat = new THREE.MeshPhongMaterial({ color:Colors.black, flatShading: true });
    var wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
    wheelTireR.position.set(25,-28,25);

    var wheelAxisGeom = new THREE.BoxGeometry(10, 10, 6);
    var wheelAxisMat = new THREE.MeshPhongMaterial({ color:Colors.lightBlack, flatShading: true });
    var wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
    wheelTireR.add(wheelAxis);

    tires.add(wheelTireR);

    var wheelProtecL = wheelProtecR.clone();
    wheelProtecL.position.z = -wheelProtecR.position.z ;
    tires.add(wheelProtecL);

    var wheelTireL = wheelTireR.clone();
    wheelTireL.position.z = -wheelTireR.position.z;
    tires.add(wheelTireL);

    var wheelTireB = wheelTireR.clone();
    wheelTireB.scale.set(.5,.5,.5);
    wheelTireB.position.set(-35,-5,0);
    tires.add(wheelTireB);

    var suspensionGeom = new THREE.BoxGeometry(4, 20, 4);
    suspensionGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 10, 0))
    var suspensionMat = new THREE.MeshPhongMaterial({ color:Colors.red, flatShading: true });
    var suspension = new THREE.Mesh(suspensionGeom,suspensionMat);
    suspension.position.set(-35, -5, 0);
    suspension.rotation.z = -.3;
    tires.add(suspension);

    return tires;
}