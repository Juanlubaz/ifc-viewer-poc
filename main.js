import * as THREE from 'https://unpkg.com/three@0.149.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.149.0/examples/jsm/controls/OrbitControls.js';
import { IFCLoader } from 'https://unpkg.com/three@0.149.0/examples/jsm/loaders/IFCLoader.js';

// 1. Escena y Fondo
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // Fondo oscuro para resaltar el modelo

// 2. Cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('viewer').appendChild(renderer.domElement);

// 4. Luces (Muy importantes para ver el IFC)
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 0.6);
light.position.set(10, 10, 10);
scene.add(light);

// 5. Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 6. Cargador IFC (Usando el oficial de Three.js para evitar el SyntaxError)
const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.39/');

// Evento de selección de archivo
document.getElementById('ifcInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    
    // Cargamos el modelo
    ifcLoader.load(url, (model) => {
        scene.add(model);
        
        // Centrar automáticamente
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        controls.update();
        
        URL.revokeObjectURL(url);
    });
});

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Ajuste de pantalla
window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
