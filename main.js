import * as THREE from "https://esm.sh/three@0.149.0";
import { OrbitControls } from "https://esm.sh/three@0.149.0/examples/jsm/controls/OrbitControls.js";
import { IFCLoader } from "https://esm.sh/web-ifc-three@0.0.126?bundle";

// Configuración básica
const container = document.getElementById("viewer");
const input = document.getElementById("ifcInput");
const progressBar = document.getElementById("progressBar");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202023);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// Cargador IFC
const ifcLoader = new IFCLoader();
// Ruta al motor WASM externa y estable
ifcLoader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.39/");

let model;

input.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    progressBar.style.display = "block";

    ifcLoader.load(url, (ifcModel) => {
        if (model) scene.remove(model);
        model = ifcModel;
        scene.add(ifcModel);

        // Ajuste de cámara al modelo
        const box = new THREE.Box3().setFromObject(ifcModel);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        controls.update();

        progressBar.style.display = "none";
    }, 
    (progress) => {
        progressBar.value = (progress.loaded / progress.total) * 100;
    },
    (error) => {
        console.error(error);
        alert("Error al cargar el IFC");
        progressBar.style.display = "none";
    });
});

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
