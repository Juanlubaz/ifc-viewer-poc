import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js";
import { IFCLoader } from "https://cdn.jsdelivr.net/npm/web-ifc-three@0.0.126/IFCLoader.js";

const container = document.getElementById("viewer");
const select = document.getElementById("modelSelect");

// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2);

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

let currentModel = null;

// Cargar modelo
function loadIFC(url) {
  if (!url) return;

  // Limpiar modelo anterior
  if (currentModel) {
    scene.remove(currentModel);
  }

  ifcLoader.load(
    url,
    (model) => {
      currentModel = model;
      scene.add(model);

      // Centrar cámara automáticamente
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      controls.target.copy(center);
      camera.position.set(
        center.x + size / 2,
        center.y + size / 2,
        center.z + size / 2
      );
      controls.update();
    },
    undefined,
    (error) => {
      console.error("Error cargando IFC:", error);
      alert("No se pudo cargar el modelo IFC");
    }
  );
}

// Evento selector
select.addEventListener("change", (e) => {
  loadIFC(e.target.value);
});

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
