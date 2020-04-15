import * as THREE from "three";
import Sea from "./sea";
import Cloud from "./cloud";

const Sky = {};

let sky = null,
    numberOfClouds = 20,
    clouds = [];

Sky.create = () => {
    sky = new THREE.Object3D();
    sky.name = "sky";

    const stepAngle = Math.PI*2 / numberOfClouds;
    for (let i = 0; i < numberOfClouds; i++) {
        const angle = stepAngle * i;
        const height = Sea.getRadius() + 150 + Math.random() * 200;
        const scale = 1 + Math.random() * 2;
        const cloud = Cloud.create();

        cloud.position.y = Math.sin(angle) * height;
        cloud.position.x = Math.cos(angle) * height;
        cloud.position.z = -300 - Math.random() * 500;
        cloud.rotation.z = angle + Math.PI / 2;
        cloud.scale.set(scale, scale, scale);

        clouds.push(cloud);
        sky.add(cloud);
    }

    sky.position.y = -Sea.getRadius();
    return sky;
}

Sky.update = (gameSpeed, deltaTime) => {
    clouds.forEach(cloud => Cloud.rotate(cloud));
    sky.rotation.z += gameSpeed * deltaTime;
}

export default Sky;