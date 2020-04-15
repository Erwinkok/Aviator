import * as THREE from "three";

const Renderer = {};

Renderer.create = (width, height) => {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;

    document.querySelector("#world").appendChild(renderer.domElement);

    return renderer;
}

export default Renderer;