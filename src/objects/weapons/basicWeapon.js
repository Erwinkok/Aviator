import * as THREE from "three";
import Colors from "../../utils/colors";
import AirPlane from "../vehicles/airplane";
import Game from "../../game";

const BasicWeapon = {};
const bullitSpeed = 100;
const bullits = [];

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
    bullits.push(bullit);
}

BasicWeapon.fire = deltaTime => {
    bullits.forEach(bullit => {
        bullit.position.x += (bullitSpeed * deltaTime);
    });

    bullits.forEach((bullit, index) => {
        if (bullit.position.x > window.innerWidth) {
            bullits.splice(index, 1);
            Game.getScene().remove(bullit);
        }
    });
}

BasicWeapon.hasBullits = () => bullits.length;

export default BasicWeapon;