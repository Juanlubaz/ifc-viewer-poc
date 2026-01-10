// Usamos versiones bloqueadas y empaquetadas (bundle) para evitar errores de exportación
import * as THREE from "https://esm.sh/three@0.149.0";
import { OrbitControls } from "https://esm.sh/three@0.149.0/examples/jsm/controls/OrbitControls.js";
import { IFCLoader } from "https://esm.sh/web-ifc-three@0.0.126?bundle";

// Elementos de la UI
const input = document.getElementById("ifcInput");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

// 1. Escena y Cámara
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202023); // Fondo oscuro profesional

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

// 2. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("viewer").appendChild(renderer.domElement);

// 3. Luces (Fundamentales para ver el modelo)
const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(1, 1, 1).normalize();
scene.add(light1);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// 4. Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 5. Cargador IFC
const ifcLoader = new IFCLoader();

// IMPORTANTE: Ruta al motor WASM externa y estable (versión sincronizada)
ifcLoader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.39/");

let model;

input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    progressContainer.style.display = "block";
    progressBar.value = 0;

    ifcLoader.load(url, (ifcModel) => {
        if (model) scene.remove(model); // Limpiar si ya había uno
        model = ifcModel;
        scene.add(ifcModel);
        
        // Centrar y ajustar la cámara al modelo cargado
        const box = new THREE.Box3().setFromObject(ifcModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()).length();

        controls.target.copy(center);
        camera.position.set(center.x + size/1.5, center.y + size/1.5, center.z + size/1.5);
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
        console.error("Error cargando el archivo:", error);
        alert("Error al procesar el IFC. Revisa la consola.");
        progressContainer.style.display = "none";
    });
};

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Ajuste si se cambia el tamaño de la ventana
window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
