import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IFCLoader } from 'web-ifc-three';

// Elementos de la interfaz
const input = document.getElementById("ifcInput");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

// 1. Escena y Cámara
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa); // Fondo gris neutro

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

// 4. Controles de ratón
const controls = new OrbitControls(camera, renderer.domElement);

// 5. Configuración del Cargador IFC
const ifcLoader = new IFCLoader();

// Esta ruta debe ser compatible con la versión de web-ifc-three
ifcLoader.ifcManager.setWasmPath("https://unpkg.com/web-ifc@0.0.39/");

let model;

input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    progressContainer.style.display = "block";

    ifcLoader.load(url, (ifcModel) => {
        if (model) scene.remove(model); // Limpiar modelo anterior
        model = ifcModel;
        scene.add(ifcModel);
        
        // Centrar automáticamente la cámara en el edificio cargado
        const box = new THREE.Box3().setFromObject(ifcModel);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
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
        alert("Hubo un error al procesar el archivo IFC.");
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

// Ajustar el visor si se cambia el tamaño de la ventana
window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
