import * as THREE from 'three';
import Colors from '../../utils/colors.ts';
import { normalize } from '../../utils/utils.ts';
import type { PointerPosition } from '../../input/inputHandler.ts';

export const DEFAULT_HEIGHT = 100;
export const HEIGHT_RANGE = 70;

export class AirPlane {
  readonly mesh = new THREE.Group();
  readonly propellor: THREE.Mesh;
  speed = 0;
  private displacementX = 0;
  private displacementY = 0;
  private collisionSpeedX = 0;
  private collisionSpeedY = 0;

  constructor(width: number) {
    this.mesh.name = 'AirPlane';
    this.propellor = createPropellor();
    this.mesh.add(createCabin(), createEngine(), createTale(), createWings(), createWindShield(), this.propellor, createTires());
    this.mesh.scale.setScalar(0.25);
    this.mesh.position.set(-width, DEFAULT_HEIGHT, 0);
  }

  update(delta: number, pointer: PointerPosition): void {
    this.speed = normalize(pointer.x, -0.5, 0.5, 1.2, 1.6);
    const frameScale = delta * 60;
    this.displacementX += this.collisionSpeedX * frameScale;
    this.displacementY += this.collisionSpeedY * frameScale;
    const targetX = normalize(pointer.x, -0.75, 0.75, -75 * 0.7, -75 * 2) + this.displacementX;
    const targetY = normalize(pointer.y, -0.75, 0.75, DEFAULT_HEIGHT - HEIGHT_RANGE, DEFAULT_HEIGHT + HEIGHT_RANGE) + this.displacementY;
    this.mesh.position.x += (targetX - this.mesh.position.x) * delta * 3.5;
    this.mesh.position.y += (targetY - this.mesh.position.y) * delta * 3.5;
    this.mesh.rotation.z = (targetY - this.mesh.position.y) * delta * 0.8;
    this.mesh.rotation.x = (this.mesh.position.y - targetY) * delta * 0.4;
    const decay = Math.max(0, 1 - delta * 3.5);
    this.collisionSpeedX *= decay;
    this.collisionSpeedY *= decay;
    this.displacementX *= decay;
    this.displacementY *= decay;
    this.propellor.rotation.x += 0.2 * frameScale + this.speed * delta * 0.005;
  }

  collide(x: number, y: number): void {
    this.collisionSpeedX = x;
    this.collisionSpeedY = y;
  }

  reset(width: number): void {
    this.speed = 0;
    this.displacementX = this.displacementY = 0;
    this.collisionSpeedX = this.collisionSpeedY = 0;
    this.mesh.position.set(-width, DEFAULT_HEIGHT, 0);
    this.mesh.rotation.set(0, 0, 0);
    this.propellor.rotation.set(0, 0, 0);
  }
}

/** Change every duplicated BufferGeometry corner, preserving the original r115 shape. */
function taperRear(geometry: THREE.BoxGeometry, upperY: number, lowerY: number, insetZ: number): void {
  const positions = geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    if (positions.getX(i) >= 0) continue;
    const y = positions.getY(i);
    const z = positions.getZ(i);
    positions.setY(i, y + (y > 0 ? upperY : lowerY));
    positions.setZ(i, z - Math.sign(z) * insetZ);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}

const createCabin = () => {
    const cabinGeometry = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);
    const cabinMaterial = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });

    taperRear(cabinGeometry, -10, 30, 20);

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

    taperRear(propGeometry, -5, 5, 5);

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
