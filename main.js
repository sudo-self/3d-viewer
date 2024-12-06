import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createSky, toggleSkyVisibility } from './sky.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);

createSky(scene);


const loader = new GLTFLoader();
let currentModel = null;
const modelUrl = "/max90.glb";

let initialModelState = { position: null, rotation: null, scale: null };

loader.load(
  modelUrl,
  (gltf) => {
    currentModel = gltf.scene;

   
    centerModel(currentModel);

  
    initialModelState.position = currentModel.position.clone();
    initialModelState.rotation = currentModel.rotation.clone();
    initialModelState.scale = currentModel.scale.clone();

   
    currentModel.rotation.y = Math.PI / 2;

    scene.add(currentModel);

    console.log("Model loaded successfully:", modelUrl);
  },
  (xhr) => {
    console.log(`Loading model: ${(xhr.loaded / xhr.total) * 100}% complete`);
  },
  (error) => console.error("Error loading the model:", error)
);

function centerModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.target.set(0, 0, 0);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const inputElement = document.createElement("input");
inputElement.type = "file";
inputElement.accept = ".glb";
inputElement.style.position = "absolute";
inputElement.style.top = "10px";
inputElement.style.left = "10px";
inputElement.style.padding = "10px";
inputElement.style.border = "none";
inputElement.style.borderRadius = "8px";
inputElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
inputElement.style.color = "#fff";
inputElement.style.cursor = "pointer";
document.body.appendChild(inputElement);

inputElement.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith(".glb")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);

      if (currentModel) scene.remove(currentModel);

      loader.load(
        url,
        (gltf) => {
          currentModel = gltf.scene;

     
          centerModel(currentModel);

        
          initialModelState.position = currentModel.position.clone();
          initialModelState.rotation = currentModel.rotation.clone();
          initialModelState.scale = currentModel.scale.clone();

          currentModel.position.set(0, 0, 2);
          currentModel.rotation.y = Math.PI;
          scene.add(currentModel);
        },
        undefined,
        (error) => console.error("Error loading the model:", error)
      );
    };
    reader.readAsArrayBuffer(file);
  }
});

function createControlPanel() {
  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "10px";
  panel.style.right = "10px";
  panel.style.zIndex = 1000;
  panel.style.padding = "10px";
  panel.style.color = "#fff";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  document.body.appendChild(panel);

  addButton(panel, "Rotate X", () => currentModel && (currentModel.rotation.x += Math.PI / 2));
  addButton(panel, "Rotate Y", () => currentModel && (currentModel.rotation.y += Math.PI / 2));
  addButton(panel, "Rotate Z", () => currentModel && (currentModel.rotation.z += Math.PI / 2));
  addButton(panel, "Reset Model", () => {
    if (currentModel) {
      currentModel.position.copy(initialModelState.position);
      currentModel.rotation.copy(initialModelState.rotation);
      currentModel.scale.copy(initialModelState.scale);
    }
  });

  return panel;
}

const toggleSkyButton = document.createElement("button");
toggleSkyButton.textContent = "Toggle Scene";
toggleSkyButton.style.position = "absolute";
toggleSkyButton.style.top = "100px";
toggleSkyButton.style.left = "10px";
toggleSkyButton.style.zIndex = 1000;
toggleSkyButton.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
toggleSkyButton.style.color = "#fff";
toggleSkyButton.style.padding = "10px";
document.body.appendChild(toggleSkyButton);

toggleSkyButton.addEventListener("click", () => {
  toggleSkyVisibility();
});


function addButton(parent, text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.style.marginBottom = "10px";
  button.style.padding = "15px";
  button.style.fontSize = "18px";
  button.style.border = "none";
  button.style.borderRadius = "20px";
  button.style.backgroundColor = "#7249d6";
  button.style.color = "#fff";
  button.style.cursor = "pointer";
  button.style.width = "100%";
  button.addEventListener("click", onClick);
  parent.appendChild(button);
}

function createLightPanel() {
  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "170px";
  panel.style.left = "10px";
  panel.style.zIndex = 1000;
  panel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  panel.style.padding = "20px";
  panel.style.color = "#fff";
  panel.style.borderRadius = "10px";

  const label = document.createElement("div");
  label.textContent = "Directional Light";
  label.style.marginBottom = "10px";
  panel.appendChild(label);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "5";
  slider.value = directionalLight.intensity;
  slider.step = "0.1";
  slider.style.width = "90%";
  slider.addEventListener("input", (event) => {
    directionalLight.intensity = parseFloat(event.target.value);
  });
  panel.appendChild(slider);

  document.body.appendChild(panel);
}

const toggleBackgroundButton = document.createElement("button");
toggleBackgroundButton.textContent = "Background";
toggleBackgroundButton.style.position = "absolute";
toggleBackgroundButton.style.top = "45px";
toggleBackgroundButton.style.left = "10px";
toggleBackgroundButton.style.zIndex = 1000;
toggleBackgroundButton.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
toggleBackgroundButton.style.color = "#fff";
toggleBackgroundButton.style.padding = "10px";
document.body.appendChild(toggleBackgroundButton);

const footer = document.createElement("footer");
footer.style.position = "absolute";
footer.style.bottom = "0";
footer.style.width = "100%";
footer.style.textAlign = "center";
footer.style.padding = "20px";
footer.style.cursor = "pointer";
footer.style.textDecoration = "none";
footer.textContent = "sudo-3d.vercel.app";
footer.addEventListener("click", () => {
  window.location.href = "https://sudo-3d.vercel.app";
});
document.body.appendChild(footer);

function updateFooterTextColor() {
  const bodyBackgroundColor = window.getComputedStyle(document.body).backgroundColor;
  const isWhiteBackground = bodyBackgroundColor === "rgb(255, 255, 255)";
  footer.style.color = isWhiteBackground ? "black" : "white";
}

function toggleBackgroundColor() {
  isBlackBackground = !isBlackBackground;
  document.body.style.backgroundColor = isBlackBackground ? "black" : "white";
  renderer.setClearColor(isBlackBackground ? 0x000000 : 0xffffff, 1);
  updateFooterTextColor();
}

let isBlackBackground = true;
toggleBackgroundButton.addEventListener("click", () => {
  toggleBackgroundColor();
});

updateFooterTextColor();

const controlsPanel = createControlPanel();
const lightPanel = createLightPanel();

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();






