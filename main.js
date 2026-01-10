import * as THREE from 'https://unpkg.com/three@0.149.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.149.0/examples/jsm/controls/OrbitControls.js';
import { IFCLoader } from 'https://unpkg.com/three@0.149.0/examples/jsm/loaders/IFCLoader.js';

// 1. Escena y Cámara
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202023);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('viewer').appendChild(renderer.domElement);

// 3. Iluminación
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(10, 10, 10);
scene.add(light);

// 4. Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 5. Configuración del Cargador IFC
const ifcLoader = new IFCLoader();
// IMPORTANTE: Ruta al motor WASM necesaria para procesar el archivo
ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.39/');

// Evento de carga
document.getElementById('ifcInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    
    ifcLoader.load(url, (model) => {
        scene.add(model);
        
        // Centrar cámara automáticamente al modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        controls.update();
        
        URL.revokeObjectURL(url);
    }, undefined, (error) => {
        console.error("Error al cargar IFC:", error);
    });
});

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Ajuste de ventana
window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
