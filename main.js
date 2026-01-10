// Usamos ESM.sh que resuelve las dependencias automáticamente
import * as THREE from "https://esm.sh/three@0.152.2";
import { OrbitControls } from "https://esm.sh/three@0.152.2/examples/jsm/controls/OrbitControls.js";
import { IFCLoader } from "https://esm.sh/web-ifc-three@0.0.126";

// Elementos del HTML
const container = document.getElementById("viewer");
const input = document.getElementById("ifcInput");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

// 1. Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2);

// 2. Cámara
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// 4. Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 5. Luces
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(10, 10, 10);
scene.add(light);

// 6. Configuración de IFC Loader
const ifcLoader = new IFCLoader();

// IMPORTANTE: Ruta al motor WASM
ifcLoader.ifcManager.setWasmPath("https://cdn.jsdelivr.net/npm/web-ifc@0.0.44/dist/");

let currentModel = null;

input.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  progressBar.value = 0;
  progressContainer.style.display = "block";

  const url = URL.createObjectURL(file);

  ifcLoader.load(
    url,
    (model) => {
      currentModel = model;
      scene.add(model);

      // Centrado automático
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();

      controls.target.copy(center);
      camera.position.set(center.x + size / 1.5, center.y + size / 1.5, center.z + size / 1.5);
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
      alert("Error al cargar el IFC. Mira la consola para detalles.");
      progressContainer.style.display = "none";
    }
  );
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
