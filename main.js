import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js";
import { IFCLoader } from "https://cdn.jsdelivr.net/npm/web-ifc-three@0.0.126/IFCLoader.js";

const container = document.getElementById("viewer");

// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Cámara
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 10, 10);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Luces
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(10, 20, 10);
scene.add(light);

// IFC Loader
const ifcLoader = new IFCLoader();
await ifcLoader.ifcManager.setWasmPath(
  "https://cdn.jsdelivr.net/npm/web-ifc@0.0.46/"
);

// Cargar IFC desde el repo
ifcLoader.load(
  "./models/modelo.ifc",
  (model) => scene.add(model),
  (progress) => console.log("Cargando...", progress),
  (error) => console.error(error)
);

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Loop
function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
