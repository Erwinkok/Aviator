import * as THREE from "three";
import Colors from "../../utils/colors";

const Cloud = {};

Cloud.create = () => {
    const cloud = new THREE.Object3D();
    cloud.name = "cloud";

    const geom = new THREE.CubeGeometry(20,20,20);
    const mat = new THREE.MeshPhongMaterial({ color: Colors.white, flatShading: true });

    const numberOfBlocks = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numberOfBlocks; i++) {
        const scale = .1 + Math.random() * .9;
        const mesh = new THREE.Mesh(geom.clone(), mat);
        mesh.position.x = i * 15;
        mesh.position.y = Math.random() * 10;
        mesh.position.z = Math.random() * 10;
        mesh.rotation.z = Math.random() * Math.PI * 2;
        mesh.rotation.y = Math.random() * Math.PI * 2;
        mesh.scale.set(scale, scale, scale);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        cloud.add(mesh);
    }

    return cloud;
}

Cloud.rotate = cloud => {
    cloud.children.forEach((mesh, index) => {
        mesh.rotation.z += Math.random() * .005 * (index + 1);
        mesh.rotation.y += Math.random() * .002 * (index + 1);
    });
}

export default Cloud;