import * as THREE from "three";
import Game from "../../game";
import Colors from "../../utils/colors";
import AirPlane from "../vehicles/airplane";
import Meteor from "../landscape/meteor";

const BasicWeapon = {};
const bullitSpeed = 200;
const bullits = new Set();

BasicWeapon.create = () => {
    const bullit = new THREE.Object3D();

    const bullitBaseGeometry = new THREE.CylinderGeometry(2, 2, 5, 8, 1);
    const bullitBaseMaterial = new THREE.MeshPhongMaterial({ color: Colors.black, flatShading: true });
    const bullitBase = new THREE.Mesh(bullitBaseGeometry, bullitBaseMaterial);
    bullitBase.rotation.z = Math.PI / 2;
    bullitBase.receiveShadow = true;
    bullitBase.castShadow = true;

    const bullitHeadGeometry = new THREE.SphereGeometry(2, 10, 10);
    const bullitHeadMaterial = new THREE.MeshPhongMaterial({ color: Colors.black, flatShading: true });
    const bullitHead = new THREE.Mesh(bullitHeadGeometry, bullitHeadMaterial);
    bullitHead.position.x = 3;
    bullitHead.receiveShadow = true;
    bullitHead.castShadow = true;

    bullit.add(bullitBase);
    bullit.add(bullitHead);

    return bullit;
}

BasicWeapon.add = bullit => {
    bullit.position.x = AirPlane.getPosition().x + 15;
    bullit.position.y = AirPlane.getPosition().y;
    bullits.add(bullit);
}

BasicWeapon.fire = deltaTime => {
    bullits.forEach(bullit => {
        bullit.position.x += (bullitSpeed * deltaTime);
    });

    bullits.forEach(bullit => {
        if (bullit.position.x > window.innerWidth) {
            bullits.delete(bullit);
            Game.getScene().remove(bullit);
        }

        const meteors = Meteor.getAllMeteors();
        meteors.forEach(meteor => {
            const positionDifference = bullit.position.clone().sub(meteor.position.clone());

            if (positionDifference.length() < 12) {
                Game.getScene().remove(meteor);
                Meteor.delete(meteor);

                Game.getScene().remove(bullit);
                bullits.delete(bullit);
            }
        });
    });
}

BasicWeapon.hasBullits = () => bullits.length;

export default BasicWeapon;