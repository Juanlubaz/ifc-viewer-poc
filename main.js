// VERSIÓN 4.0 - TEST DE CARGA DIRECTA
console.log("¡El archivo main.js ha sido detectado correctamente!");

import * as THREE from 'https://unpkg.com/three@0.149.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.149.0/examples/jsm/controls/OrbitControls.js';
import { IFCLoader } from 'https://unpkg.com/three@0.149.0/examples/jsm/loaders/IFCLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202023);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('viewer').appendChild(renderer.domElement);

const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.39/');

document.getElementById('ifcInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    ifcLoader.load(URL.createObjectURL(file), (model) => {
        scene.add(model);
        console.log("Modelo IFC añadido a la escena");
    });
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
