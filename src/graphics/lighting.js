
import * as THREE from "three";
import Colors from "../utils/colors";

const Lighting = {};

let hemisphereLight,
    ambientLight,
    directionalLight;

/**
 * 
 * @param {THREE.Scene} scene 
 */
Lighting.create = scene => {
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .5);
    // ambientLight = new THREE.AmbientLight(0xdc8874, .5);
    ambientLight = new THREE.AmbientLight(Colors.offWhite, .5);
    directionalLight = new THREE.DirectionalLight(0xffffff, .4);
    directionalLight.position.set(150, 500, 350);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -400;
    directionalLight.shadow.camera.right = 400;
    directionalLight.shadow.camera.top = 400;
    directionalLight.shadow.camera.bottom = -400;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;

    // const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(cameraHelper);

    scene.add(hemisphereLight);
    scene.add(ambientLight);
    scene.add(directionalLight);
}

Lighting.update= deltaTime => {
    ambientLight.intensity += (.5 - ambientLight.intensity) * deltaTime * 0.005;
}

export default Lighting;