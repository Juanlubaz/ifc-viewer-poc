import * as THREE from 'https://cdn.skypack.dev/three@0.135.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js';
import { IFCLoader } from 'https://cdn.skypack.dev/three-ifc-loader@1.0.2';

const container = document.getElementById('viewer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202023);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.36/");

document.getElementById('ifcInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    ifcLoader.load(url, (model) => {
        scene.add(model);
        const box = new THREE.Box3().setFromObject(model);
        controls.target.copy(box.getCenter(new THREE.Vector3()));
        controls.update();
    });
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
