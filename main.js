// Usamos URLs completas para que el navegador resuelva los módulos sin errores
import * as THREE from 'https://unpkg.com/three@0.149.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.149.0/examples/jsm/controls/OrbitControls.js';
import { IFCLoader } from 'https://unpkg.com/three@0.149.0/examples/jsm/loaders/IFCLoader.js';

// 1. Escena y Cámara
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // Fondo oscuro profesional

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('viewer').appendChild(renderer.domElement);

// 3. Luces
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(10, 10, 10);
scene.add(light);

// 4. Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 5. Cargador IFC y Motor WASM (Sincronizados)
const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.39/');

// Evento de selección de archivo
document.getElementById('ifcInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    
    ifcLoader.load(url, (model) => {
        scene.add(model);
        
        // Centrar automáticamente la cámara al modelo cargado
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        controls.update();
        
        URL.revokeObjectURL(url); // Liberar memoria
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

// Responsividad: Ajustar si se cambia el tamaño de la ventana
window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
