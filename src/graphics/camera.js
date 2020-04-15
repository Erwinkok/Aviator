import * as THREE from "three";
import Utils from "../utils/utils";
import AirPlane from "../objects/vehicles/airplane";
import InputHandler from "../input/inputHandler"; 

const Camera = {};

let camera = null;

/**
 * @param {Number} width 
 * @param {Number} height 
 */
Camera.create = (width, height) => {
    const aspectRatio = width / height;
    const FOV = 75;
    const nearPlane = 1;
    const farPlane = 10000;

    camera = new THREE.PerspectiveCamera(FOV, aspectRatio, nearPlane, farPlane);
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = AirPlane.getDefaultHeight();

    return camera;
}

Camera.update = deltaTime => {
    camera.fov = Utils.normalize(InputHandler.mousePos.x, -1, 1, 40, 90);
    camera.updateProjectionMatrix ();
    camera.position.y += (AirPlane.getPosition().y - camera.position.y) * deltaTime * 0.002;
}

Camera.resize = (width, height) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

export default Camera;