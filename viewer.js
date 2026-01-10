// VISOR IFC - VERSIÓN 8.0 (LIMPIEZA TOTAL)
console.log("Visor detectado: viewer.js cargado correctamente.");

import * as THREE from 'https://unpkg.com/three@0.149.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.149.0/examples/jsm/controls/OrbitControls.js';
import { IFCLoader } from 'https://unpkg.com/three@0.149.0/examples/jsm/loaders/IFCLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('viewer').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.39/');

document.getElementById('ifcInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    ifcLoader.load(url, (model) => {
        scene.add(model);
        const box = new THREE.Box3().setFromObject(model);
        controls.target.copy(box.getCenter(new THREE.Vector3()));
        controls.update();
        console.log("Modelo cargado con éxito.");
    });
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
