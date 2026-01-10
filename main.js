import * as THREE from "https://cdn.skypack.dev/three@0.135.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js";
import { IFCLoader } from "https://cdn.skypack.dev/three-ifc-loader@1.0.2";

// Elementos de la interfaz
const input = document.getElementById("ifcInput");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

// 1. Escena y Cámara
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202023);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("viewer").appendChild(renderer.domElement);

// 3. Luces
const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(1, 1, 1).normalize();
scene.add(light1);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// 4. Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 5. Configuración del Cargador IFC
const ifcLoader = new IFCLoader();
// Esta ruta al motor WASM es compatible con esta versión del cargador
ifcLoader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.36/");

let model;

input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    progressContainer.style.display = "block";
    progressBar.value = 0;

    ifcLoader.load(url, (ifcModel) => {
        if (model) scene.remove(model);
        model = ifcModel;
        scene.add(ifcModel);
        
        // Centrar cámara automáticamente
        const box = new THREE.Box3().setFromObject(ifcModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()).length();
        controls.target.copy(center);
        camera.position.set(center.x + size, center.y + size, center.z + size);
        controls.update();

        progressContainer.style.display = "none";
        URL.revokeObjectURL(url);
    }, 
    (progress) => {
        if (progress.total) {
            progressBar.value = (progress.loaded / progress.total) * 100;
        }
    },
    (error) => {
        console.error(error);
        alert("Error al cargar el archivo. Revisa la consola.");
        progressContainer.style.display = "none";
    });
};

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
