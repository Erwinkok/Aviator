import * as THREE from "three";
import Color from "../utils/colors";

const Scene = {};

Scene.create = () => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(Color.orange, 100, 950);

    return scene
}

export default Scene;