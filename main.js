import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js";
import { IFCLoader } from "https://cdn.jsdelivr.net/npm/web-ifc-three@0.0.110/dist/IFCLoader.js";
;


// HTML
const container = document.getElementById("viewer");
const input = document.getElementById("ifcInput");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

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

// IFC Loader (SIN await)
const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath(
  "https://cdn.jsdelivr.net/npm/web-ifc@0.0.38/"
);

let currentModel = null;

input.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  console.log("Archivo seleccionado:", file.name);

  // Limpiar modelo previo
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
      console.log("IFC cargado correctamente");

      currentModel = model;
      scene.add(model);

      // Centrar cámara
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
      alert("Error al cargar el archivo IFC");
      progressContainer.style.display = "none";
    }
  );
});

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
