import * as THREE from "three";
import Colors from "../../utils/colors";

const Sea = {},
    seaRadius = 800,
    seaLength = 800,
    wavesMinAmp = 5,
    wavesMaxAmp = 20,
    wavesMinSpeed = 0.001,
    wavesMaxSpeed = 0.003,
    waves = [];

let sea = null;

Sea.create = () => {
    const geometry = new THREE.CylinderGeometry(seaRadius, seaRadius, seaLength, 40, 10);
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    geometry.mergeVertices();
    geometry.vertices.forEach(vertice => {
        waves.push({
            y: vertice.y,
            x: vertice.x,
            z: vertice.z,
            ang: Math.random() * Math.PI * 2,
            amp: wavesMinAmp + Math.random() * (wavesMaxAmp - wavesMinAmp),
            speed: wavesMinSpeed + Math.random() * (wavesMaxSpeed - wavesMinSpeed)
        });
    });

    const material = new THREE.MeshPhongMaterial({ color: Colors.blue, flatShading: true, shininess: 0 });

    sea = new THREE.Mesh(geometry, material);
    sea.name = "waves";
    sea.receiveShadow = true;
    sea.position.y = -seaRadius;

    return sea;
}

Sea.update = (gameSpeed, deltaTime) => {
    sea.rotation.z += gameSpeed * deltaTime;

    if (sea.rotation.z > 2 * Math.PI) {
        sea.rotation.z -= 2 * Math.PI;
    }

    const vertices = sea.geometry.vertices;
    vertices.forEach((vertice, index) => {
        const wave = waves[index];
        vertice.x = wave.x + Math.cos(wave.ang) * wave.amp;
        vertice.y = wave.y + Math.sin(wave.ang) * wave.amp;
        wave.ang += wave.speed * deltaTime;
        sea.geometry.verticesNeedUpdate = true;
    });
}

Sea.getRadius = () => seaRadius;

export default Sea;