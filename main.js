import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js";

// Usamos una ruta directa y estable de la librería web-ifc-three
import { IFCLoader } from "https://cdn.jsdelivr.net/npm/web-ifc-three@0.0.126/dist/IFCLoader.js";

// Elementos del HTML
const container = document.getElementById("viewer");
const input = document.getElementById("ifcInput");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

// 1. Escena básica
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

// 4. Controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 5. Luces (importante para ver el modelo 3D)
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(10, 20, 10);
scene.add(light);

// 6. Configuración del Cargador IFC
const ifcLoader = new IFCLoader();

// IMPORTANTE: Esta ruta contiene los archivos .wasm necesarios para procesar el IFC
ifcLoader.ifcManager.setWasmPath("https://cdn.jsdelivr.net/npm/web-ifc@0.0.44/dist/");

let currentModel = null;

input.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Limpiar modelo anterior si existe
  if (currentModel) {
    scene.remove(currentModel);
  }

  progressBar.value = 0;
  progressContainer.style.display = "block";

  const url = URL.createObjectURL(file);

  ifcLoader.load(
    url,
    (model) => {
      currentModel = model;
      scene.add(model);

      // Encuadre automático
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();

      controls.target.copy(center);
      camera.position.set(center.x + size / 1.2, center.y + size / 1.2, center.z + size / 1.2);
      controls.update();

      progressContainer.style.display = "none";
      URL.revokeObjectURL(url); // Liberar memoria
    },
    (progress) => {
      if (progress.total) {
        progressBar.value = (progress.loaded / progress.total) * 100;
      }
    },
    (error) => {
      console.error("Error al cargar el IFC:", error);
      alert("No se pudo cargar el archivo. Revisa la consola.");
      progressContainer.style.display = "none";
    }
  );
});

// Manejo de redimensión de ventana
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Bucle de renderizado
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
