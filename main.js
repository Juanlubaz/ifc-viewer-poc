import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js";
import { IFCLoader } from "https://cdn.jsdelivr.net/npm/web-ifc-three@0.0.126/dist/IFCLoader.js";

// Elementos del HTML
const container = document.getElementById("viewer");
const input = document.getElementById("ifcInput");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

// 1. Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2);

// 2. Cámara
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
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
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(10, 20, 10);
scene.add(light);

// 6. Configuración de IFC Loader
const ifcLoader = new IFCLoader();

// Ajustamos la ruta al motor WASM para que coincida con la versión de la librería
ifcLoader.ifcManager.setWasmPath(
  "https://cdn.jsdelivr.net/npm/web-ifc@0.0.44/dist/"
);

let currentModel = null;

// Evento de carga de archivo
input.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  console.log("Archivo seleccionado:", file.name);

  // Limpiar modelo previo si existe
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  // Mostrar barra de progreso
  progressBar.value = 0;
  progressContainer.style.display = "block";

  const url = URL.createObjectURL(file);

  ifcLoader.load(
    url,
    (model) => {
      console.log("IFC cargado correctamente");
      currentModel = model;
      scene.add(model);

      // Centrar cámara automáticamente al modelo cargado
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      controls.target.copy(center);
      camera.position.set(
        center.x + size / 1.5,
        center.y + size / 1.5,
        center.z + size / 1.5
      );
      controls.update();

      progressContainer.style.display = "none";
      URL.revokeObjectURL(url);
    },
    (progress) => {
      if (progress.total) {
        const percent = (progress.loaded / progress.total) * 100;
        progressBar.value = percent;
      }
    },
    (error) => {
      console.error("Error cargando IFC:", error);
      alert("Error al cargar el archivo IFC. Revisa la consola para más detalles.");
      progressContainer.style.display = "none";
    }
  );
});

// Ajuste de ventana (Resize)
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Bucle de animación
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
