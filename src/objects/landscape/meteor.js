import * as THREE from "three";
import Colors from "../../utils/colors";
import Game from "../../game";
import AirPlane from "../vehicles/airplane";

const Meteor = {};
const meteors = new Set();
let minDistance = 20;
let maxDistance = 100;
let nextDistance = 0;
let lastMeteor = 0;
let speed = 0.6;

Meteor.create = () => {
    const meteorGeometry = new THREE.TetrahedronGeometry(10, 2);
    const meteorMaterial = new THREE.MeshPhongMaterial({ color: Colors.red, shininess: 0, flatShading: true });
    const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);
    meteor.castShadow = true;
    meteor.receiveShadow = true;

    return meteor;
}

Meteor.spawn = () => {
    const gameDistance = Math.floor(Game.getDistance());

    if (nextDistance === 0) {
        nextDistance = Math.floor(Math.random() * (maxDistance - minDistance) + minDistance);
    }

    if (gameDistance > (lastMeteor + nextDistance)) {
        const meteor = Meteor.create();
        meteor.angle = - Math.random();
        meteor.distance = 800 + AirPlane.getDefaultHeight() + (-1 + Math.random() * 2) * (AirPlane.getAmpHeight() - 20);

        lastMeteor = gameDistance;
        nextDistance = 0;

        meteors.add(meteor);
        Game.getScene().add(meteor);
    }
}

Meteor.rotate = (gameSpeed, deltaTime) => {
    meteors.forEach((meteor, index) => {
        meteor.angle += gameSpeed * deltaTime * speed;

        if (meteor.angle > Math.PI * 2) {
            meteor.angle -= Math.PI * 2;
        } 

        meteor.position.y = -800 + Math.sin(meteor.angle) * meteor.distance;
        meteor.position.x = Math.cos(meteor.angle) * meteor.distance;
        meteor.rotation.z += Math.random() * 0.1;
        meteor.rotation.y += Math.random() * 0.1;

        const differenceInPosition = AirPlane.getPosition().clone().sub(meteor.position.clone());
        if (differenceInPosition.length() < 12) {
            Game.getScene().remove(meteor);
            meteors.delete(meteor);

            const planeCollisionSpeedX = 5 * differenceInPosition.x / differenceInPosition.length();
            const planeCollisionSpeedY = 5 * differenceInPosition.y / differenceInPosition.length();
            AirPlane.setPositionDisplacement(planeCollisionSpeedX, planeCollisionSpeedY);

            return;
        }

        if (meteor.angle > Math.PI) {
            meteors.delete(index, 1);
            Game.getScene().remove(meteor);
            return;
        }
    });
}

Meteor.delete = meteor => meteors.has(meteor) && meteors.delete(meteor);

Meteor.getAllMeteors = () => meteors;

export default Meteor;